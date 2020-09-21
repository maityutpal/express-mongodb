const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favourites = require("../models/favourites");

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favourites) => {
          // extract favourites that match the req.user.id
          if (favourites) {
            userFavourites = favourites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];
            if (!userFavourites) {
              var err = new Error("You have no favourite dish!");
              err.status = 404;
              return next(err);
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(userFavourites);
          } else {
            var err = new Error("There are no favourite dishes");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then((favourites) => {
        var userFavourites;
        if (favourites)
          userFavourites = favourites.filter(
            (fav) => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (!userFavourites)
          userFavourites = new Favourites({ user: req.user.id });

        for (let i of req.body) {
          var dishAvailable;
          console.log(userFavourites.dishes.length);
          if (userFavourites.dishes.length > 0) {
            dishAvailable = userFavourites.dishes.find(
              (dishId) => dishId == i._id
            );
          }

          if (!dishAvailable) {
            userFavourites.dishes.push(i._id);
          }
        }
        userFavourites
          .save()
          .then(
            (userFavs) => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favourite Dish Created");
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /favourites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favourites) => {
          var favRemoveData;
          if (favourites) {
            favRemoveData = favourites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];
          }
          if (favRemoveData) {
            favRemoveData.remove().then(
              (result) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
              },
              (err) => next(err)
            );
          } else {
            var err = new Error("You do not have any favourites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favouriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favourites) => {
          if (favourites) {
            const userFav = favourites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];
            const dish = userFav.dishes.filter(
              (dish) => dish.id === req.params.dishId
            )[0];
            if (dish) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            } else {
              var err = new Error(
                "You do not have favouritedish " + req.params.dishId
              );
              err.status = 404;
              return next(err);
            }
          } else {
            var err = new Error("You do not have any favourite dishes");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then((favourites) => {
        var userFav;
        if (favourites)
          userFav = favourites.filter(
            (fav) => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (!userFav) userFav = new Favourites({ user: req.user.id });
        if (
          !userFav.dishes.find((d_id) => {
            if (d_id._id)
              return d_id._id.toString() === req.params.dishId.toString();
          })
        )
          userFav.dishes.push(req.params.dishId);

        userFav
          .save()
          .then(
            (userFavs) => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favourites Created");
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /favourites/:dishId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favourites) => {
          var userFav;
          if (favourites)
            userFav = favourites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];
          if (userFav) {
            userFav.dishes = userFav.dishes.filter(
              (dishid) => dishid._id.toString() !== req.params.dishId
            );
            userFav.save().then(
              (result) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
              },
              (err) => next(err)
            );
          } else {
            var err = new Error("You do not have any favourites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favouriteRouter;
