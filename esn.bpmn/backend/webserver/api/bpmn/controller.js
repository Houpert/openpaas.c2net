'use strict';

var logger, core, filestore;

function findCreatorFile(req, res) {
  if(!req.user._id){
    return res.status(400).json({error: {code: 400, message: 'Bad Request', details: 'The user isn\'t connected'}});
  }

  var query = {
    metadata : {
      creator : {
        objectType: 'user',
        id: req.user._id
      }
    }
  };

  var result = filestore.find(query, function(err, meta) {
    if (err) {
      return res.status(500).json({error: {code: 500, message: 'Error while searching file', details: err ? err.message : response.body}});
    }
    if (!meta) {
      return res.status(500).json({error: {code: 500, message: 'Error while searching file, no files found'}});
    }
    if (meta) {
      return res.status(200).json(meta);
    }
  });
  return res.status(200).json(result);
}

module.exports = function(dependencies) {
  logger = dependencies('logger');
  filestore = dependencies('filestore');
  core = require('./core')(dependencies);

  return {
    findCreatorFile: findCreatorFile
  };
};
