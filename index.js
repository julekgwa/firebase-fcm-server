import { makeApp } from './app/app.js';

makeApp()
  .then(app => app.listen(8080))
  .then(() => {
    console.log('Server started')
  })
  .catch(err => {
    console.error('caught error', err)
  })