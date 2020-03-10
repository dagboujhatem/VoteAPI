'use strict';

module.exports = function(Sujet) {

  /* to added the createdAt field automaticly */
  Sujet.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.createdAt = new Date();
    }
    next();
  });

  /* */
  Sujet.findSujet = function(BodyData, cb) {

    Sujet.find({include: { relation: 'votes'}})
      .then( (sujetsFound) => {
        if (sujetsFound !== undefined && sujetsFound !== null) {
          const sujetsJSON = JSON.parse(JSON.stringify(sujetsFound));
          let response = [];
          sujetsJSON.forEach((sujet) => {
            let sujetObject = {
              id: sujet.id,
              titre: sujet.titre,
              description: sujet.description
            };
            if (sujet.votes !== undefined && sujet.votes  !== null && sujet.votes.length > 0) {
              /* calculer if User a le droit de voter */
              const userVoted = sujet.votes.filter(vote => {
                return  vote.backofficeUserId == BodyData.backofficeUserId;
                });
              if (userVoted !== undefined && userVoted !== null){
                sujetObject['userVotedStatus'] = true ;
              } else {
                sujetObject['userVotedStatus'] = false ;
              }
              /* calculer le pourcentage de vote */
              const votedTrue = sujet.votes.filter(vote => { return vote.voteValue == true;});
              sujetObject['score'] = (votedTrue.length / sujet.votes.length) * 100;
              sujetObject['hasVote'] = true;
            }
            else{
              sujetObject['userVotedStatus'] = true ;
              sujetObject['score'] = 0 ;
              sujetObject['hasVote'] = false;
            }
            /* added sujet to response */
            response.push(sujetObject);
          });
          cb(null, response);
        }
        else{
          cb(null, {});
        }
      }).catch((error) => {
      cb(error);
    });
  };

  Sujet.remoteMethod(
    'findSujet',
    {
      description: 'Get all',
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
