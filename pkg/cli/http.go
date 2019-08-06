// Copyright 2018 github.com/ucirello
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cli

import (
	"bufio"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"

	"cirello.io/bookmarkd/pkg/mail"
	"cirello.io/bookmarkd/pkg/pubsub"
	"cirello.io/bookmarkd/pkg/tasks"
	"cirello.io/bookmarkd/pkg/web"
	"cirello.io/errors"
	"github.com/urfave/cli"
)

func (c *commands) httpMode() cli.Command {
	return cli.Command{
		Name:        "http",
		Aliases:     []string{"serve"},
		Usage:       "http mode",
		Description: "starts bookmarkd web server",
		Flags: []cli.Flag{
			cli.StringFlag{
				Name:   "bind",
				Value:  ":8080",
				EnvVar: "BOOKMARKD_LISTEN",
			},
			cli.StringFlag{
				Name:   "mx-bind",
				Value:  ":25",
				EnvVar: "BOOKMARKD_MX_LISTEN",
			},
			cli.StringFlag{
				Name:   "mx-domain",
				Value:  "localhost",
				EnvVar: "BOOKMARKD_MX_DOMAIN",
			},
			cli.StringFlag{
				Name:   "mx-sender",
				Value:  "",
				EnvVar: "BOOKMARKD_MX_SENDER",
			},
			cli.StringFlag{
				Name:   "mx-recipient",
				Value:  "",
				EnvVar: "BOOKMARKD_MX_RECIPIENT",
			},
			cli.StringFlag{
				Name:   "ca-cert",
				EnvVar: "BOOKMARKD_CA_CERT",
				Value:  "ca.pem",
			},
			cli.StringFlag{
				Name:   "acceptable-users-file",
				EnvVar: "BOOKMARKD_ACCEPTABLE_USERS_FILE",
				Value:  "bookmarkd.users",
			},
		},
		Action: func(ctx *cli.Context) error {
			lHTTP, err := net.Listen("tcp", ctx.String("bind"))
			if err != nil {
				return errors.E(err, "cannot bind port")
			}
			lMX, err := net.Listen("tcp", ctx.String("mx-bind"))
			if err != nil {
				return errors.E(err, "cannot bind port (MX)")
			}
			broker := pubsub.New()
			tasks.Run(c.db)
			mail.Run(lMX, c.db, broker, ctx.String("mx-domain"), ctx.String("mx-sender"), ctx.String("mx-recipient"))
			caCert, err := ioutil.ReadFile(ctx.String("ca-cert"))
			if err != nil {
				log.Println("skipping CA file:", err)
			}
			users, err := readUsersListFile(ctx.String("acceptable-users-file"))
			if err != nil {
				log.Println("skipping users list file:", err)
			}
			srv, err := web.New(c.db, caCert, users, broker)
			if err != nil {
				return errors.E(err)
			}
			err = http.Serve(lHTTP, srv)
			return errors.E(err)
		},
	}
}

func readUsersListFile(fn string) ([]string, error) {
	var users []string
	fd, err := os.Open(fn)
	if err != nil {
		return users, errors.E(err, "cannot open users list file")
	}
	scanner := bufio.NewScanner(fd)
	for scanner.Scan() {
		users = append(users, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		return users, errors.E(err, "cannot read users list")
	}
	return users, nil
}
