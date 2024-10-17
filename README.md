# NodeJS CRUD and PostgreSQL with docker compose

Simple NodeJS todo app, which can create users, login and create tasks, connected with PostgreSQL database.

### Building and running your application

>Before starting the app, make sure change the **postgres.env.example** file to **postgres.env** and **.env.example** file in app/ dir to **.env**, and change the password values inside.

When you're ready, start your application by running:

`$ docker compose up -d`

Your application will be available at http://localhost:3000.

### Create a new user
```$ curl -X POST http://localhost:3000/signup -H "Content-Type: application/json" -d '{"username": "testuser", "password": "testpass"}'```

### Login 
```$ curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username": "testuser", "password": "testpass"}'```

Response:
```
{
  "token": "your_jwt_token_here"
}
```

### Add a new task
```$ curl -X POST http://localhost:3000/tasks -H "Authorization: Bearer your_jwt_token_here" -H "Content-Type: application/json" -d '{"title": "Sample Task", "description": "This is a test task"}'```

### Retrieve tasks
```$ curl -X GET http://localhost:3000/tasks -H "Authorization: Bearer your_jwt_token_here"```

### Update the existing task
```$ curl -X PUT http://localhost:3000/tasks/1 -H "Authorization: Bearer your_jwt_token_here" -H "Content-Type: application/json" -d '{"title": "Updated Task", "description": "This is an updated task"}'```

### Delete tasks
```$ curl -X DELETE http://localhost:3000/tasks/1 -H "Authorization: Bearer your_jwt_token_here"```


### Note to Remember

1. For PostgreSQL:
    >PostgreSQL default user is **postgres**. Creating different user using **POSTGRES_USER** variables can generate **"FATAL: database "your-db-username" does not exist"** error. This is because (as far as I know) of **healthcheck**. 
    >If you don't specify the database name in **pg_isready** heathcheck command, it assume the default database name as the same as database username.
    >**Just specify the username, password(optional) and database name in your ``pg_isready`` healthcheck command as required**.

    >Env variables need to be called by **double dollar sign($$)** in **healthcheck**.



