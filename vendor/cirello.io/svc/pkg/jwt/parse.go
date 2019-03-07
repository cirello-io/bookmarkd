// Copyright 2019 github.com/ucirello and https://cirello.io. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to writing, software distributed
// under the License is distributed on a "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.

package jwt

import (
	"bytes"
	"encoding/json"

	"cirello.io/errors"
	jwt "github.com/dgrijalva/jwt-go"
)

// Parse decodes the JWT from the given string. It will return only a valid
// token, and an error otherwise.
func Parse(t string, caPEM []byte) (*jwt.Token, ServiceClaims, error) {
	var claims ServiceClaims
	token, err := jwt.ParseWithClaims(t, &claims,
		func(token *jwt.Token) (interface{}, error) {
			return caPEM, nil
		})
	if err != nil {
		return nil, ServiceClaims{},
			errors.E(errors.Invalid, err, "cannot parse token")
	}
	if !token.Valid {
		return nil, ServiceClaims{},
			errors.E(errors.Invalid, "not is not valid")
	}
	return token, claims, nil
}

// Claims from a given token. It will return not OK if a ServiceClaim is not
// found.
func Claims(t *jwt.Token) (ServiceClaims, error) {
	var sc ServiceClaims
	claims, ok := t.Claims.(jwt.MapClaims)
	if !ok {
		return sc, errors.E("not a claim map")
	}
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(claims); err != nil {
		return sc, errors.E(err, "cannot encode claim map")
	}
	if err := json.NewDecoder(&buf).Decode(&sc); err != nil {
		return sc, errors.E(err, "cannot decode service claims")
	}
	return sc, nil
}
