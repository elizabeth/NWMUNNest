'use strict';

const Permission = use('App/Models/Permission');
const { validate } = use('Validator');


class PermissionController {
  // Gets all of the permissions
  async index({response}) {
    const permissions = await Permission.all();
    return response.status(200).json(permissions);
  }

  // Creates the Permissions
  async create({request, response}) {

    // Sets parameters for validation
    const validation = await validate(request.all(), {
      group: 'required|unique:permissions'
    });

    // Sends error message
    if (validation.fails()) {
      return response.status(409).send(validation.messages());
    }

    // Creates new permissions object
    const permission = new Permission();
    permission.group = request.input('group');

    // Saves
    await permission.save();

    return response.status(200).json(permission);
  }
}

module.exports = PermissionController;
