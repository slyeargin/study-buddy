'use strict';

var users = global.nss.db.collection('users');
var bcrypt = require('bcrypt');
var Mongo = require('mongodb');
var _ = require('lodash');

class User{
  constructor(obj){
    this.email = obj.email;
    this.password = obj.password;
    this.type = obj.type;
    this.scores = [];
  }

  save(fn){
    users.save(this, (e,u)=>fn(u));
  }

  addScore(score, courseId, fn){
    var scores = this.scores;
    courseId = Mongo.ObjectID(courseId);
    var dupCheck = _.find(scores, {courseId: courseId});
    if (dupCheck) {
      dupCheck.score = score;
    } else {
      scores.push({courseId:courseId, score:score});
    }
    fn(this);
  }

  create(fn){
    users.findOne({email: this.email}, (e, u)=>{
      if(u){
        fn(null);
      }else{
        this.password = bcrypt.hashSync(this.password, 8);
        users.save(this, (e, u)=>fn(u));
      }
    });
  }

  login(fn){
    users.findOne({email: this.email}, (e, u)=>{
      if(u){
        var isMatch = bcrypt.compareSync(this.password, u.password);
        if(isMatch){
          fn(u);
        } else {
          fn(null);
        }
      } else {
        fn(null);
      }
    });
  }

  static findById(userId, fn){
    userId = Mongo.ObjectID(userId);
    users.findOne({_id: userId}, (e, user)=>{
      user = _.create(User.prototype, user);
      fn(user);
    });
  }

}

module.exports = User;
