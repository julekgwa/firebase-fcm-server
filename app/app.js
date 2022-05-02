import express from 'express';
import SwaggerParser from 'swagger-parser';
import { connector } from 'swagger-routes-express';
import config from 'config';
import * as OpenApiValidator from 'express-openapi-validator';
import { deleteNotification } from './controllers/deleteNotification.js';
import { scheduleNotification } from './controllers/scheduleNotification.js';
import { login } from './controllers/login.js';
import { updateNotification } from './controllers/updateNotification.js';
import { StatusCodes } from 'http-status-codes';
import swaggerUI from 'swagger-ui-express';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const SECRET_KEY = config.get('secretKey');

const routes = {
  deleteNotification,
  scheduleNotification,
  login,
  updateNotification,
};

const authenticateMiddleware = async (req) => {

  const { authorization } = req.headers;
  // eslint-disable-next-line no-magic-numbers
  const token = authorization && authorization.split(' ')[1];

  if (token === null) return false;
  const user = await jwt.verify(token, SECRET_KEY);

  req.user = user;
  return true;

};

const makeApp = async () => {

  const parser = new SwaggerParser();
  const apiDescription = await parser.validate('app/swagger/swagger.yml');
  const connect = connector(routes, apiDescription);
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(
    OpenApiValidator.middleware({
      apiSpec: 'app/swagger/swagger.yml',
      validateSecurity: {
        handlers: {
          jwt: authenticateMiddleware,
        },
      },
    }),
  );
  app.use((err, req, res, next) => {

    res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
      errors: err.errors,
    });

  });

  // swagger ui
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(apiDescription));

  connect(app);
  return app;

};

export { makeApp };
