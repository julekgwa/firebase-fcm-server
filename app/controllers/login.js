import { authUserById } from '../clients/firebaseClient.js';
import { ERROR_MSG } from '../helpers/utils.js';
import { StatusCodes } from 'http-status-codes';
export const login = async (req, res) => {

  try {

    const response = await authUserById(req.body.userId);

    res.status(StatusCodes.OK).json({
      access_token: response,
    });

  } catch (error) {

    const message = error.message || ERROR_MSG;

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message,
    });

  }

};
