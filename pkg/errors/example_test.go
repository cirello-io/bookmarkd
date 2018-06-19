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

// Based on upspin.io/errors

// +build !debug

package errors_test

import (
	"fmt"

	"upspin.io/errors"
	"upspin.io/upspin"
)

func ExampleError() {
	path := upspin.PathName("jane@doe.com/file")
	user := upspin.UserName("joe@blow.com")

	// Single error.
	e1 := errors.E(errors.Op("Get"), path, errors.IO, "network unreachable")
	fmt.Println("\nSimple error:")
	fmt.Println(e1)

	// Nested error.
	fmt.Println("\nNested error:")
	e2 := errors.E(errors.Op("Read"), path, user, errors.Other, e1)
	fmt.Println(e2)

	// Output:
	//
	// Simple error:
	// Get: jane@doe.com/file: I/O error: network unreachable
	//
	// Nested error:
	// Read: jane@doe.com/file, user joe@blow.com: I/O error:
	//	Get: network unreachable
}

func ExampleMatch() {
	path := upspin.PathName("jane@doe.com/file")
	user := upspin.UserName("joe@blow.com")
	err := errors.Str("network unreachable")

	// Construct an error, one we pretend to have received from a test.
	got := errors.E(errors.Op("Get"), path, user, errors.IO, err)

	// Now construct a reference error, which might not have all
	// the fields of the error from the test.
	expect := errors.E(user, errors.IO, err)

	fmt.Println("Match:", errors.Match(expect, got))

	// Now one that's incorrect - wrong Kind.
	got = errors.E(errors.Op("Get"), path, user, errors.Permission, err)

	fmt.Println("Mismatch:", errors.Match(expect, got))

	// Output:
	//
	// Match: true
	// Mismatch: false
}
