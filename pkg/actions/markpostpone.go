// Copyright 2019 github.com/ucirello
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

package actions

import (
	"cirello.io/bookmarkd/pkg/models"
	"cirello.io/errors"
	"github.com/jmoiron/sqlx"
)

// MarkBookmarkAsPostpone moves a bookmark to a delayed position in the inbox.
func MarkBookmarkAsPostpone(db *sqlx.DB, id int64, broadcast func(msg interface{})) error {
	dao := models.NewBookmarkDAO(db)
	b, err := dao.GetByID(id)
	if err != nil {
		return errors.E(errors.Internal, err, "cannot find bookmark")
	}
	b.Inbox = 2
	if err := dao.Update(b); err != nil {
		return errors.E(errors.Internal, err, "cannot update bookmarkd")
	}
	broadcast(
		&struct {
			WSType   string           `json:"type"`
			Bookmark *models.Bookmark `json:"bookmark"`
		}{
			"BOOKMARK_UPDATED",
			b,
		},
	)
	return nil
}
