"use strict";

/**
 * @author Copyright Saud Bin Habib
 */



const fs = require('fs');

var message = module.exports = {};

message.setup = function user(app, logger, STRINGS, HTTP, models, http, request, bcrypt, config, OP , nodemailer) {


  /**
   * @api {post}  /api/referListing  Refer Listing.
   * @apiName referListing
   * @apiGroup MessageController
   *
   * @apiSuccess (Success) {JSON} new users.
   */
  app.post('/api/referListing', function InsertUserCallback( req, res ) {
    logger.info('Inside post /api/messageController');

    var date = new Date();
    console.log(req.body.email);
    console.log(req.body.subject);
    console.log(req.body.url);
    console.log(req.body.name);
    var transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
            user: 'omer.aslamteam@gmail.com',
            pass: 'omerAslam12'
        }
    });
    
    const mailOptions = {
      from: 'Group 15 & 19 <omer.aslamteam@gmail.com>', 
      to: req.body.email,
      subject: req.body.subject,
      html: "<p> Mr "+ req.body.name+" refer this property to you <br> This is a perfect house for purchasing. Feel free to contact with the Agent <br> <br></p> <a href='" + req.body.url + "'>"
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if(err){
        console.log(err);
        logger.info(STRINGS.RESULT_FAILED);
        response.message = STRINGS.ERROR_MESSAGE;
        res.status( HTTP.OK ).jsonp( err );
      }else{
        logger.info ( STRINGS.RESULT_SUCCESS );
        response.message = STRINGS.RESULT_SUCCESS;
        res.status( HTTP.OK ).jsonp( info );
      }    
    });  
  });

  /**
   * @api {Post}  /api/PostMessage  Send Message.
   * @apiName PostMessage
   * @apiGroup messageController
   *
   * @apiSuccess (Success) {JSON} messages.
  */
  app.post('/api/PostMessage', function insertingMessage( req , res ) {
    logger.info('Inside post /api/postMessage');
    var me = this;
    var response = {
      success: false
    };
    models.UserMessage.findOne({
      where: {
        [OP.or]: [{
          [OP.and]: [
            { SenderID: req.body.senderId },
            { ReceiverID: req.body.receiverId }
          ]},
          {[OP.and]: [
            { ReceiverID: req.body.senderId },
            { SenderID: req.body.receiverId }
          ]
        }]
      }
    }).then(message => {
        if(message !== null && message !== '') {
          models.UserMessage.create({
            MessageText: req.body.msgTxt,
            MsgStatus: 0,
            ConversationID: message.ConversationID,
            SenderID: req.body.senderId,
            ReceiverID: req.body.receiverId, 
          }).then(function ( message ){
            logger.info(STRINGS.RESULT_SUCCESS );
            response.success = true;
            response.message = STRINGS.USER_MESSAGE_SEND;
            response.data = message;
            res.status( HTTP.OK ).jsonp( response );
          }).catch(function(err) {
            logger.info(STRINGS.RESULT_FAILED);
            response.message = STRINGS.ERROR_MESSAGE;
            response.data = err
            res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
          });
        } else {
      models.UserMessage.max('ConversationID').then(max => {  
        var conId ;
        if ( isNaN(parseInt(max)) ) {
          conId = 1;
        } else {
          conId = parseInt(max) + 1;
        }
        models.UserMessage.create({
              MessageText: req.body.msgTxt,
              MsgStatus: 0,
              ConversationID: conId,
              SenderID: req.body.senderId,
              ReceiverID: req.body.receiverId, 
            }).then(function ( message ){
              logger.info(STRINGS.RESULT_SUCCESS );
              response.success = true;
              response.message = STRINGS.USER_MESSAGE_SEND;
              response.data = message;
              res.status( HTTP.OK ).jsonp( response );
            }).catch(function(err) {
              logger.info(STRINGS.RESULT_FAILED);
              response.message = STRINGS.ERROR_MESSAGE;
              response.data = err
              res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
            });
      });
        }  
      }).catch(function(err) {
        logger.info(STRINGS.RESULT_FAILED);
        response.message = STRINGS.ERROR_MESSAGE;
        response.data = err;
        res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
     });
    });


  /**
    * @api {get}  /api/GetAllMessages  Get All messages.
    * @apiName GetAllMessages
    * @apiGroup messageController
    *
    * @apiSuccess (Success) {JSON} messages.
  */
   
  app.get('/api/GetAllMessages', function getUserCallback( req, res ) {
    logger.info('Inside get /api/GetAllMessages');

    var me = this;
    console.log(req.query.conversationID);
    var response = {
      success: false
    };

    models.sequelize.query("SELECT m.Id, m.MessageText, m.ConversationID, DATE_FORMAT(m.createdAt, '%D %b, %y %h:%i') as MsgDate, m.SenderID, concat(u1.FirstName, ' ', u1.LastName) as SenderName, m.ReceiverID, concat(u2.FirstName, ' ', u2.LastName) as ReceiverName,    m.MsgStatus, u1.UserImagePath as SenderImage, u2.UserImagePath as ReceiverImage FROM `fa17g19`.`UserMessages` as m inner join `fa17g19`.`Users` as u1 on u1.UserId = m.SenderId inner join `fa17g19`.`Users` as u2 on u2.UserId = m.ReceiverId where m.ConversationID = " + req.query.conversationID + " order by m.createdAt asc;", 
    { type: models.sequelize.QueryTypes.SELECT}).then(message => {    
      if(message !== null && message !== '') {
        // console.log(message.ConversationID);
        logger.info ( STRINGS.RESULT_SUCCESS );
        response.success = true;
        response.message = STRINGS.USER_MESSAGE_RETEREIVE
        response.data = message;
        res.status( HTTP.OK ).jsonp( response );
             
      } else {
        logger.info ( STRINGS.RESULT_SUCCESS );
        response.message = STRINGS.PASSWORD_INCORRECT;
        response.data = null;
        res.status( HTTP.OK ).jsonp( response );
      }
    }).catch(function(err) {
      console.log(err);
      logger.info(STRINGS.RESULT_FAILED);
      response.message = STRINGS.ERROR_MESSAGE;
      response.data = err;
      res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
    });
  });


/**
  * @api {get}  /api/GetAllConversastions  Get All Conversations.
  * @apiName GetAllConversastions
  * @apiGroup messageController
  *
  * @apiSuccess (Success) {JSON} messages.
*/

app.get('/api/GetAllConversations', function getUserCallback( req, res ) {
    logger.info('Inside get /api/GetAllConversations');
    var me = this;
    var response = {
      success: false
    };
    // models.sequelize.query(" SELECT M.Id, M.ConversationID, M.SenderID, M.ReceiverID,DATE_FORMAT(M.createdAt, '%D %b, %y %h:%i') as MsgDate, M.MessageText, concat(u1.FirstName, ' ', u1.LastName) as ReceiverName, concat(u2.FirstName, ' ', u2.LastName) as SendererName, u2.UserImagePath as image FROM `fa17g19`.`usermessages` as M inner join `fa17g19`.`users` as u1 on u1.UserId = m.ReceiverId inner join `fa17g19`.`users` as u2 on u2.UserId = m.SenderId INNER JOIN (SELECT SenderID, max(Id) as maxId FROM `fa17g19`.`usermessages` WHERE ReceiverID = " + req.query.receiverID + " GROUP BY SenderID)T ON M.Id = T.maxId order by M.createdAt desc;" , 
    models.sequelize.query("Select M.Id, M.ConversationID, M.SenderID, M.ReceiverID,DATE_FORMAT(M.createdAt, '%D %b, %y %h:%i') as MsgDate, M.MessageText, concat(u1.FirstName, ' ', u1.LastName) as ReceiverName, concat(u2.FirstName, ' ', u2.LastName) as SendererName, u2.UserImagePath as SenderImage , u1.UserImagePath as ReceiverImage from `fa17g19`.`UserMessages` as M inner join `fa17g19`.`Users` as u1 on u1.UserId = M.ReceiverID inner join `fa17g19`.`Users` as u2 on u2.UserId = M.SenderID where Id in (Select t1.MsgId from (SELECT ConversationID, max(Id) as MsgId FROM `fa17g19`.`UserMessages` where SenderID = " + req.query.receiverID + " or ReceiverID = " + req.query.receiverID + " group by ConversationID) as t1) order by M.createdAt desc;" , 
    { type: models.sequelize.QueryTypes.SELECT}).then(message => {    
      
      if(message !== null && message !== '') {
        logger.info ( STRINGS.RESULT_SUCCESS );
        response.success = true;
        response.message = STRINGS.USER_MESSAGE_RETEREIVE
        response.data = message;
        res.status( HTTP.OK ).jsonp( response );       
      } else {
        logger.info ( STRINGS.RESULT_SUCCESS );
        response.message = STRINGS.USER_MESSAGE_NOT_EXIST;
        response.data = null;
        res.status( HTTP.OK ).jsonp( response );
      }
    }).catch(function(err) {
      logger.info(STRINGS.RESULT_FAILED);
      response.message = STRINGS.ERROR_MESSAGE;
      response.data = err;
      res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
    });
  });

}