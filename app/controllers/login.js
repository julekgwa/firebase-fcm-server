import { authUserById } from '../clients/firebaseClient.js';
import { ERROR_MSG } from '../helpers/utils.js';

export const login = async(req, res) => {
 try {
   const response = await authUserById(req.body.userId);
   res.status(200).json({
     access_token: response
   })
 } catch (error) {
   const message = error.message || ERROR_MSG
   res.status(500).json({
     message
   })
 }
}