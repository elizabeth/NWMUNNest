# NWMUN-Nest Notes

1. Run: npm install
2. Run: npm run adonis serve --dev

NOTE: You may wanna install adonis on global. There are some weird cases where the local doesn't do as you need.

# To-Do:
* Do we want to make it so a user can only be logged in once? Currently we're supporting multiple sessions.

# Other instructions
1. Setup the Database and Seed: ```bash adonis  migration:run --seed```

---
--- 
# API Routing

## Users
### GET `/api/v1/users`
Gets all the users. _(Will be Deprecated)_
#### Response
Array of all the user objects.
#### Sample Response
```
{
    "data": {
        "user_id": 1,
        "code": "$2a$10$F/uv96nv66pQaSBa5yhyku381kLBoX4jYnqSiq8kYrHWy0PuDa3O2",
        "quantity": 1,
        "checked_in": 0,
        "created_at": "2018-10-25 08:28:21",
        "updated_at": "2018-10-25 08:28:21"
    }
}
```
---
### POST `/api/v1/users/register`
Creates a new user.
#### Parameters
* `email`: An email address (required, unique)
* `password`: Password in cleartext (required)

#### Response
JWT Auth Token
#### Sample Response
```
{
    "message": "User email@email.com successfully registered.",
    "data": {
        "type": "bearer",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsImlhdCI6MTU0MDQ4MDczMH0.Np5nWQyjZt1P_U0WpRyv-fpcopsOcE57lByECLwz2n0",
        "refreshToken": null
    }
}
```
---
### POST `/api/v1/users/authenticate`
Creates a new user.
#### Parameters
* `email`: An email address (required, unique)
* `password`: Password in cleartext (required)

#### Response
JWT Auth Token
#### Sample Response
```
{
    "data": {
        "type": "bearer",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsImlhdCI6MTU0MDQ4MTA1NH0.hFR-9sAfX1kIg5qRq-qiyrpgPIjm8gdJ_-3m7ANw4jI",
        "refreshToken": null
    }
}
```
---
## Ticket _(JWT Authentication Required)_
### GET `/api/v1/ticket`
Gets the current user's ticket. _(Will be Deprecated)_
#### Response
Ticket object
#### Sample Response
```
{
    "user_id": 1,
    "code": "$2a$10$F/uv96nv66pQaSBa5yhyku381kLBoX4jYnqSiq8kYrHWy0PuDa3O2",
    "quantity": 1,
    "checked_in": 0,
    "created_at": "2018-10-25 08:28:21",
    "updated_at": "2018-10-25 08:28:21"
}
```
---
### POST `/api/v1/ticket/generate`
Creates a new ticket.
#### Parameters
* `quantity`: Quantity of tickets (required)
* `email`: The email address being registered.

#### Response
Ticket Object
#### Sample Response
```
{
    "message": "Ticket created for: email2@email.com",
    "data": {
        "code": "$2a$10$F/uv96nv66pQaSBa5yhyku381kLBoX4jYnqSiq8kYrHWy0PuDa3O2",
        "registered_by": 1,
        "email": "email2@email.com",
        "quantity": "2",
        "created_at": "2018-11-10 21:40:04",
        "updated_at": "2018-11-10 21:40:04"
    }
}
```
---
### PUT `/api/v1/ticket/checkin`
Checks the user in.
#### Parameters
* `code`: User's ticket code

#### Response
Ticket Object
#### Sample Response
```
{
    "message": "User checked in.",
    "data": {
        "code": "$2a$10$F/uv96nv66pQaSBa5yhyku381kLBoX4jYnqSiq8kYrHWy0PuDa3O2",
        "email": "email2@email.com",
        "registered_by": 1,
        "quantity": 2,
        "checked_in": 1,
        "created_at": "2018-11-10 21:40:04",
        "updated_at": "2018-11-10 21:44:33"
    }
}
```
---
---

# Adonis fullstack application

This is the fullstack boilerplate for AdonisJs, it comes pre-configured with.

1. Bodyparser
2. Session
3. Authentication
4. Web security middleware
5. CORS
6. Edge template engine
7. Lucid ORM
8. Migrations and seeds

## Setup

Use the adonis command to install the blueprint

```bash
adonis new yardstick
```

or manually clone the repo and then run `npm install`.


### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```
