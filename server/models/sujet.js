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
      .then( (sujets) => {
        let response = [];

        sujets.forEach((sujet) => {
          let sujetObject = {};
          sujetObject['titre'] = sujet.titre;
          sujetObject['description'] = sujet.description;
          /* calculer if User a le droit de voter */
          /* calculer le pourcentage de vote */
          /* added sujet to response */
          response.push(sujetObject);
        });

        cb(null, response);
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
      http: {verb: 'get'},
    }
  );
};
