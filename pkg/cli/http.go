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
	"net"
	"net/http"

	"cirello.io/bookmarkd/pkg/errors"
	"cirello.io/bookmarkd/pkg/tasks"
	"cirello.io/bookmarkd/pkg/web"
	"gopkg.in/urfave/cli.v1"
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
				Name:   "username",
				EnvVar: "BOOKMARKD_USERNAME",
			},
			cli.StringFlag{
				Name:   "password",
				EnvVar: "BOOKMARKD_PASSWORD",
			},
		},
		Action: func(ctx *cli.Context) error {
			l, err := net.Listen("tcp", ctx.String("bind"))
			if err != nil {
				return errors.E(ctx, err, "cannot bind port")
			}
			tasks.Run(c.db)
			username := ctx.String("username")
			password := ctx.String("password")
			srv, err := web.New(c.db, username, password)
			if err != nil {
				return errors.E(ctx, err)
			}
			err = http.Serve(l, srv)
			return errors.E(ctx, err)
		},
	}
}
