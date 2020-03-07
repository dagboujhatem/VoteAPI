'use strict';

let moment = require('moment');
module.exports = function(Vote) {

  /* to added the createdAt field automaticly */
  Vote.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.createdAt = new Date();
    }
    next();
  });

  /*  to added a vote */


  Vote.addVote = function(BodyData, cb) {

    Vote.count({backofficeUserId: BodyData.backofficeUserId, createdAt: {gt: moment().subtract(1,'days').toDate()}})
      .then( (count) => {
        if (count < 5) {
          /* added a new vote is autorised */
          Vote.create(BodyData).then( (voteCreated) => {
              cb(null,voteCreated);
            }
          ).catch( (err) => { cb(err); } );

        }else{
          const error = new Error();
          error.statusCode = 401;
          error.code = 'MAX_VOTE';
          cb(error);
        }
    }).catch( (error) => {
      cb(error);
    });

  };

  Vote.remoteMethod(
    'addVote',
    {
      description: 'Added a vote',
      accepts: [
        {arg: 'BodyData', type: 'object', required: true, http: {source: 'body'}}
      ],
      returns: {
        arg: 'bodyResponse', type: 'object', root: true
      },
      http: {verb: 'post'},
    }
  );

};
