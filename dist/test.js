"use strict";

require("6to5/polyfill");var Promise = (global || window).Promise = require("lodash-next").Promise;var __DEV__ = (process.env.NODE_ENV !== "production");var __PROD__ = !__DEV__;var __BROWSER__ = (typeof window === "object");var __NODE__ = !__BROWSER__;var Remutable = require("../");

var user1 = { id: 1325325, name: "Isaac Asimov" };
var user2 = { id: 5128581, name: "Robert Heinlein" };
var userList = new Remutable();
console.log(userList.serialize());
console.log(userList.uid);
userList.set(user1.id, user1);
userList.set(user2.id, user2);
console.log(JSON.stringify(userList.commit())); // patch string
var str = userList.serialize();
console.log(str);
var remoteUserList = Remutable.unserialize(str);
remoteUserList.equals(userList); // true
remoteUserList.map(function (user) {
  console.log(user.name);
}); // 'Isaac Asimov' 'Robert Heinlein'
userList.del(user1.id);
userList.get(user1.id); // undefined
var patch = userList.commit();
remoteUserList.equals(userList); // false
remoteUserList.canApply(patch); // true
remoteUserList.apply(patch);
remoteUserList.map(function (user) {
  console.log(user.name);
}); // 'Robert Heinlein'
remoteUserList.set(user1.id, user2);
remoteUserList.get(user1.id); // { id: 5128581, name: 'Robert Heinlein' }
remoteUserList.rollback();
console.log(remoteUserList.get(user1.id)); // undefined
console.log(remoteUserList.uid);