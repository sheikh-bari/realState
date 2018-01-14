/**
 * @author Copyright Abdul-Bari.
 */

'use strict'

const fs = require('fs');

/**
 * Service Class.
 * @class User
 * @author Guda-Praveen-Kumar
 * @param {file} app app filepath.
 * @param {file} logger logger filepath.
 * @param {file} STRINGS STRINGS filepath.
 * @param {file} HTTP HTTP filepath.
 * @param {file} model database models.
 * @param {file} http http String filepath.
 * @param {file} request request filepath.
 * @param {Object} Sequelize operators
 *
 * @returns {void}
 */

function Service( _config, _logger, _STRINGS, _HTTP, _http, _request ) {
  this.config = _config;
  this.logger = _logger;
  this.STRINGS = _STRINGS;
  this.HTTP = _HTTP;
  this.http = _http;
  this.https = _https;
}

Service.prototype.uploadFiles = function( file, temporaryPath, folderPath, targetPath, fs, callback ) {
  var me = this;

  if ( file && file.size > 0 ) {
    try {
      // Create parent folder if it does not exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      // move the file from the temporary location to the target folder location
      var is = fs.createReadStream(temporaryPath);
      var os = fs.createWriteStream(targetPath);

      is.pipe(os);

      is.on('end', function() {
        // remove file
        fs.unlinkSync(temporaryPath);
      });
    } catch ( err ) {
      responseJSON.status = HTTP.FAIL_TEXT;
      responseJSON.message = err;
    }
  }
};



module.exports = Service;