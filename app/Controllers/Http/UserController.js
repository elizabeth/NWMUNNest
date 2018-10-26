'use strict'

class UserController {

  static get inject() {
    return ['App/Models/User', 'Validator'];
  }

  constructor(User, Validator) {
    this.User = User;
    this.Validator = Validator;
  }


  async index({response}) {
    const users = await this.User.all();
    return response.status(200).json(users);
  }

  async register({request, response, auth}) {
    const validation = await this.Validator.validate(request.all(), {
      email: 'required|unique:users',
      password: 'required'
    });

    if (validation.fails()) {
      return response.status(400).send(validation.messages());
    }

    const user = new this.User();
    user.email = request.input('email');
    user.password = request.input('password');
    user.permissions_id = 3;

    await user.save();

    // Generates JWT Token
    const token = await auth.generate(user);

    return response.status(200).json({
      message: 'User ' + user.email + ' successfully registered.',
      data: token
    });
  }

  async authenticate({request, response, auth}) {
    try {
      const authParameters = request.only(['email', 'password']);

      if(!authParameters) {
        return response.status(404).json({
          data: 'Resource not found.',
        });
      }

      const token = await auth.attempt(authParameters.email, authParameters.password)

      return response.json({
        data: token
      });
    } catch(error) {
      return response.status(400).json({
        status: 'Error Authenticating.',
        message: 'A problem occured while trying to authenticate. Please try again.'
      });
    }
  }
}

module.exports = UserController
