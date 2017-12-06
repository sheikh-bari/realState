"use strict";

/**
* @author Copyright Guda Praveen Kumar.
*/

const fs = require('fs');

var listing = module.exports = {};

/**
 * user Class.
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

 listing.setup = function listing(app, logger, STRINGS, HTTP, models, http, request, OP) {

  /**
   * @api {get}  /api/listings  List Of All Listings.
   * @apiName ListAllListings
   * @apiGroup Listings
   *
   * @apiSuccess (Success) {JSON} all listings.
   */

  app.post('/api/listings', function getListingsCallback(req, res){
    logger.info('Inside get /api/listings');

    var response = {};
    var pagination = parseInt( req.body.pageIndex );
    pagination = isNaN( pagination ) ? 0 : pagination;

    if ( (  req.body.searchText === null || req.body.searchText === undefined || req.body.searchText.trim() === '')
      && ( req.body.typeOfAccomodation === null || req.body.typeOfAccomodation === undefined || req.body.typeOfAccomodation.trim() === '' )
      && ( req.body.noOfBedRooms === null || req.body.noOfBedRooms === undefined || req.body.noOfBedRooms.trim() === '' )
      && ( req.body.squareFeet === null || req.body.squareFeet === undefined || req.body.squareFeet.trim() === '' )
      && ( req.body.adType === null || req.body.adType === undefined || req.body.adType.trim() === '' )) {

      models.RealEstateAd.findAll({
        attributes: ['Id', 'Title', 'AdDescription', 'Price', 'City', 'State', 'Address', 'Latitude', 'Longitude' ],
        order: [['createdAt','DESC']],
        include: [
          {
            model: models.AdMedia,
            duplicating: false,
            attributes: ['ImagePath']
          },
          {
            model: models.AdType,
            duplicating: false,
            attributes: ['AdTypeName']
          },
          {
            model: models.RealEstateCategory,
            duplicating: false,
            attributes: ['CategoryName']
          }
        ],
        offset: pagination,
        limit: 12,
        
      }).then( listings => {
        response.success = true;
        response.message = STRINGS.GET_LISTINGS_SUCCESS;
        response.data = listings;
        res.status( HTTP.OK ).jsonp( response );
      }).catch( function( err ){
        logger.info(STRINGS.RESULT_FAILED);
        response.success = false;
        response.message = STRINGS.GET_LISTINGS_FAILURE;
        response.data = err;
        res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
      });
      
    } else {
      var searchTextQuery = {};
      var noOfBedRoomsQuery = {};
      var squareFeetQuery = {};

      var includeQuery = [];
      var adMediaTable = {
        model: models.AdMedia,
        duplicating: false,
        attributes: ['ImagePath']
      };

      includeQuery.push(adMediaTable);

      var typeOfAccomodationQuery = {
        model: models.RealEstateCategory,
        duplicating: false,
        attributes: ['CategoryName']
      };
      var adTypeQuery = {
        model: models.AdType,
        duplicating: false,
        attributes: ['AdTypeName']
      };

      if ( req.body.searchText.trim() !== '' && req.body.searchText !== null && req.body.searchText !== undefined ) {

        searchTextQuery = {
          $or:[
            {
              city: {
                [OP.like]: '%'+req.body.searchText+'%'
              }
            },
            {
              state: {
                [OP.like]: '%'+req.body.searchText+'%'
              }
            },
            {
              zip: {
                [OP.like]: '%'+req.body.searchText+'%'
              }
            }
          ]
        };
      }

      if ( req.body.squareFeet !== null && req.body.squareFeet !== undefined && req.body.squareFeet.trim() !== '' ) {
        squareFeetQuery = {
          SquareFeet: {
            [OP.eq]: req.body.squareFeet
          }
        }
      } 

      if ( req.body.noOfBedRooms !== null && req.body.noOfBedRooms !== undefined && req.body.noOfBedRooms.trim() !== '' ) {
        noOfBedRoomsQuery = {
          BedRooms: {
            [OP.eq]: req.body.noOfBedRooms
          }
        } 
      }

      if ( req.body.adType !== null && req.body.adType !== undefined && req.body.adType.trim() !== '' ) {
        adTypeQuery.where = {
          Id: {
            [OP.eq]: req.body.adType
          }
        }
      }
      includeQuery.push(adTypeQuery);

      
      if( req.body.typeOfAccomodation !== null && req.body.typeOfAccomodation !== undefined && req.body.typeOfAccomodation.trim() !== '' ) {
        typeOfAccomodationQuery.where = {
          Id: {
            [OP.eq]: req.body.typeOfAccomodation
          }
        }
      }
      includeQuery.push( typeOfAccomodationQuery );

      searchTextQuery['$and'] = [
        squareFeetQuery, noOfBedRoomsQuery
      ];

      models.RealEstateAd.findAll({
        attributes: ['Id', 'Title', 'AdDescription', 'Price', 'City', 'State', 'Address', 'Latitude', 'Longitude' ],
        order: [['createdAt','DESC']],
        where: searchTextQuery,
        include: includeQuery,
        offset: pagination,
        limit: 12
      }).then(listings =>{
        logger.info( STRINGS.RESULT_SUCCESS );
        response.success = true;
        response.message = STRINGS.GET_LISTINGS_SUCCESS;
        response.data = listings;
        res.status( HTTP.OK ).jsonp(response);
      }).catch(function(err){
        logger.info(STRINGS.RESULT_FAILED);
        response.success = false;
        response.message = STRINGS.GET_LISTINGS_FAILURE;
        response.data = err;
        res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
      });
    }

   });


  /**
   * @api {get}  /api/listing  Get Specific Listing details.
   * @apiName GetListing
   * @apiGroup Listing
   *
   * @apiSuccess (Success) {JSON} Listings.
   */

  app.get('/api/listing', function getListingsCallback(req, res){
    logger.info('Inside get /api/lisitng');

    var me = this;
    var response = {};

    if ( isNaN(parseInt(req.query.listing_id)) ) {
      response.success = false;
      response.message = STRINGS.INVALID_ID;
      response.data = null;
      res.status( HTTP.BAD_REQUEST ).jsonp( response );
    } else {
      models.RealEstateAd.findOne({
        where: { ID: {[OP.eq]: req.query.listing_id}},
        include: [
          {
            model: models.AdType,
            attributes: ['AdTypeName']
          },
          {
            model: models.AdStatus,
            attributes: ['AdStatusName']
          },
          {
            model: models.RealEstateCategory,
            attributes: ['CategoryName']
          },
          {
            model: models.AdMedia,
            attributes: ['ImagePath']
          }
        ]
      }).then(listing => {
        logger.info( STRINGS.RESULT_SUCCESS );
        if ( listing !== null ) {
          var agentId = listing.AgentId;

          models.User.findOne({
            attributes: ['FirstName', 'LastName', 'UserImagePath'],
            where: {
              UserId: agentId
            },
            include: [
              {
                model: models.RealEstateCompanies,
                attributes: ['CompanyName']
              }
            ]
          }).then(user => {
            listing.dataValues.AgentName = user.FirstName + ' ' + user.LastName;
            listing.dataValues.AgentCompany = user.RealEstateCompany.CompanyName;
            listing.dataValues.AgentImage = user.UserImagePath;
            response.success = true;
            response.message = STRINGS.RESULT_SUCCESS;
            response.data = listing;
            res.status(HTTP.OK).jsonp(response);
          }).catch(function(err){
            logger.info(STRINGS.RESULT_FAILED);
            response.success = false;
            response.message = STRINGS.RESULT_FAILED;
            response.data = err;
            res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( err );
          });
        } else {
          response.success = true;
          response.message = STRINGS.RESULT_SUCCESS;
          response.data = listing;
          res.status( HTTP.OK ).jsonp(response);
        }
      }).catch(function( err ){
        logger.info(STRINGS.RESULT_FAILED);
        response.success = false;
        response.message = STRINGS.RESULT_SUCCESS;
        response.data = err;
        res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( err );
      });
    } 
  });

  /**
   * @api {post}  /api/favoriteListing  Adding/Deleting new Listing.
   * @apiName favoriteListing
   * @apiGroup Listing
   *
   * @apiSuccess (Success) {JSON} new listing.
   */

  app.post('/api/favoriteListing', function InsertUserCallback( req, res ) {
    logger.info('Inside post /api/Listing');

    var date = new Date();
    var response = {
      
    };
    var flag = req.body.Status;
    if(flag == true){
      models.FavouriteAds.create({
        RealEstateAdID: req.body.AdID,
        UserUserId: req.body.UserID,
      }).then(function(fav) {
          logger.info ( STRINGS.RESULT_SUCCESS );
          response.success = true;
          response.message = STRINGS.FAVORITE_ADDED;
          response.data = fav;
          res.status( HTTP.OK ).jsonp( response );
      }).catch(function(err) {
          logger.info ( err );
          response.success = false;
          response.message = STRINGS.ERROR_MESSAGE;
          response.data = null;
          res.status( HTTP.OK ).jsonp( err );
      });
    }else{
      models.sequelize.query(" delete from `fa17g19`.`favouriteads` where `RealEstateAdID` = " + req.body.AdID + " and `UserUserId` = " + req.body.UserID + " ; ", 
      { type: models.sequelize.QueryTypes.DELETE}).then(favorite => {    
        if(favorite !== null && favorite !== '') {
          logger.info ( STRINGS.RESULT_SUCCESS );
          response.success = true;
          response.message = STRINGS.FAVORITE_DELETED;
          response.data = favorite;
          res.status( HTTP.OK ).jsonp( response );        
        } else {
          logger.info ( STRINGS.RESULT_SUCCESS );
          response.success = false;
          response.message = STRINGS.ERROR_MESSAGE;
          response.data = null;
        }
      }).catch(function(err) {
        console.log(err);
        logger.info(STRINGS.RESULT_FAILED);
        response.message = STRINGS.ERROR_MESSAGE;
        response.data = err;
        res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
      });
    }

  });


  /**
   * @api {post}  /api/listing  insert new Listing.
   * @apiName GetListing
   * @apiGroup Listing
   *
   * @apiSuccess (Success) {JSON} new listing.
   */

  app.post('/api/listing', function InsertListingCallback(req, res){
    logger.info('Inside post /api/listing');

    var date = new Date();
    var response = {};

    models.RealEstateAd.create({
      AgentId: req.body.AgentId,                              
      BedRooms: req.body.bedrooms, 
      BathRooms: req.body.bathrooms, 
      Kitchen: req.body.kitchen, 
      LivingRooms: req.body.living_room,
      SquareFeet: req.body.square_feet, 
      Price: req.body.price,
      Address: req.body.address, 
      Zip: req.body.zip, 
      State: req.body.state,
      City: req.body.city, 
      AdDescription: req.body.description, 
      Parking: req.body.parking, 
      NumOfFloors: req.body.no_of_floors, 
      LotArea: req.body.lot_area,
      AdStatusId: req.body.ad_status,
      AdTypeId: req.body.ad_type,
      RealEstateCategoryId: req.body.real_estate_category_id, 
      Title: req.body.title,
      createdAt: date.now,
      updatedAt: date.now
    }).then(function( listing ){

      logger.info ( STRINGS.RESULT_SUCCESS );
      response.success = true;
      response.message = STRINGS.AD_CREATED_SUCCESS;
      response.data = listing;
      res.status( HTTP.OK ).jsonp( response );

    }).catch(function( err ) {

      logger.info(STRINGS.RESULT_FAILED);
      response.success = false;
      response.message = STRINGS.AD_CREATED_FAIL;
      res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( err );
    });

   });


  /**
   * @api {post}  /api/listing  Update existing Listing.
   * @apiName UpdateListing
   * @apiGroup Listing
   *
   * @apiSuccess (Success) {JSON} new listing.
   */

  app.post('/api/updateListing', function InsertListingCallback(req, res){
    logger.info('Inside post /api/listing');

    var date = new Date();
    var me = this;
    var response = {};

    models.RealEstateAd.update({
     AgentId: req.body.AgentId,                              
     BedRooms: req.body.BedRooms, 
     BathRooms: req.body.BathRooms, 
     Kitchen: req.body.Kitchen, 
     LivingRooms: req.body.LivingRooms,
     SquareFeet: req.body.SquareFeet, 
     Price: req.body.Price,
     Address: req.body.Address, 
     Zip: req.body.Zip, 
     State: req.body.State,
     City: req.body.City, 
     AdDescription: req.body.AdDescription, 
     Parking: req.body.Parking, 
     NumOfFloors: req.body.NumOfFloors, 
     LotArea: req.body.LotArea, 
     createdAt: date.now,
     updatedAt: date.now
    }, {
      where: {
        ID: {[OP.eq]: req.body.ID}
      }
    }).then(function( listing ){
      logger.info ( STRINGS.RESULT_SUCCESS );
      response.success = true;
      response.message = STRINGS.AD_UPDATED_SUCCESS;
      response.data = listing;
    res.status( HTTP.OK ).jsonp( response );
    }).catch(function( err ) {
      logger.info(STRINGS.RESULT_FAILED);
      response.success = false;
      response.message = STRINGS.AD_CREATED_FAIL;
      response.data = err
      res.status( HTTP.BAD_REQUEST ).jsonp( response );
    });

   });

  /**
   * @api {post}  /api/listings/user  Get User Listings.
   * @apiName GetUserListings
   * @apiGroup Listing
   *
   * @apiSuccess (Success) {JSON} listings.
   */

  app.post('/api/listings/user', function UserListingCallback(req, res){
    logger.info('Inside post /api/listings/user');

    var response = {
      success: false
    };

    var pagination = parseInt( req.body.pageIndex );
    pagination = isNaN( pagination ) ? 0 : pagination;

    if((req.body.userId !== undefined && req.body.userId !== '') && (req.body.userType !== undefined && req.body.userType !== '')){
      if(req.body.userType == 2) {
        models.RealEstateAd.findAll({
          attributes: ['Id', 'Title', 'AdDescription', 'Price', 'City', 'State', 'Address', 'Latitude', 'Longitude' ],
          where: { AgentId: {[OP.eq]: req.body.userId}},
          order: [['createdAt','DESC']],
          include: [
            {
              model: models.AdMedia,
              duplicating: false,
              attributes: ['ImagePath']
            },
            {
              model: models.AdType,
              duplicating: false,
              attributes: ['AdTypeName']
            },
            {
              model: models.RealEstateCategory,
              duplicating: false,
              attributes: ['CategoryName']
            }
          ],
          offset: pagination,
          limit: 12,
          
        }).then( listings => {
          logger.info(STRINGS.RESULT_SUCCESS);
          response.success = true;
          response.message = STRINGS.GET_LISTINGS_SUCCESS;
          response.data = listings;
          res.status( HTTP.OK ).jsonp( response );
        }).catch( function( err ){
          logger.info(STRINGS.RESULT_FAILED);
          response.success = false;
          response.message = STRINGS.GET_LISTINGS_FAILURE;
          response.data = err;
          res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
        });
      } else {
        models.RealEstateAd.findAll({
          attributes: ['Id', 'Title', 'AdDescription', 'Price', 'City', 'State', 'Address', 'Latitude', 'Longitude' ],
          include: [
            {
              model: models.FavouriteAds,
              duplicating: false,
              attributes: ['RealEstateAdID'],
              where: { UserUserId: {[OP.eq]: req.body.userId} }
            },
            {
              model: models.AdMedia,
              duplicating: false,
              attributes: ['ImagePath']
            },
            {
              model: models.AdType,
              duplicating: false,
              attributes: ['AdTypeName']
            },
            {
              model: models.RealEstateCategory,
              duplicating: false,
              attributes: ['CategoryName']
            }
          ],
          order: [['createdAt','DESC']],
          offset: pagination,
          limit: 12,
        }).then( listings => {
          logger.info(STRINGS.RESULT_SUCCESS);
          response.success = true;
          response.message = STRINGS.GET_LISTINGS_SUCCESS;
          response.data = listings;
          res.status( HTTP.OK ).jsonp( response );
        }).catch(function(err) {
          logger.info(STRINGS.RESULT_FAILED);
          response.success = false;
          response.message = STRINGS.GET_LISTINGS_FAILURE;
          response.data = err;
          res.status( HTTP.INTERNAL_SERVER_ERROR ).jsonp( response );
        });
      }
    } else {
      logger.info ( STRINGS.RESULT_SUCCESS );
      response.message = STRINGS.USER_TYPE_AND_ID_MISSING;
      response.data = null;
      res.status( HTTP.BAD_REQUEST ).jsonp( response );
    }

  });

 }
