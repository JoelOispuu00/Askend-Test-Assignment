# Askend Test Assignment

## Notes

- **Frontend Styles**: Currently, styles have been applied only for the modal view. The default view does not have custom styles. Unfortunately, I didn’t have time to implement the styles for the default view before submitting the assignment.
- **Backend Data**: The backend currently does not seed test data. Due to time constraints, I wasn’t able to implement automatic data seeding, but the filters can be added or created manually through the API endpoints.

---

## Setup and Run the Project

### 1. Clone the repository

Clone the repository to your local machine:

```bash
git clone [https://github.com/yourusername/filter-management-system.git](https://github.com/JoelOispuu00/Askend-Test-Assignment.git) cd Askend-Test-Assignment
```

### 2. Run Backend

Navigate to the backend directory and start the backend container using Docker Compose:

```bash
cd backend docker-compose up --build
```

This command will:
- Build and start the backend container.
- By default, the backend will run on `http://localhost:8000`.

### 3. Run Frontend

Navigate to the frontend directory and start the frontend container using Docker Compose:

```bash
cd frontend docker-compose up --build
```

This command will:
- Build and start the frontend container.
- By default, the frontend will run on `http://localhost:3000`.

---

## API Endpoints and Their Usage

### 1. **GET /api/filters**

- **Description**: Fetch all the existing filters.
- **Response**: Returns an array of all filters with their criteria.

Example response:
```json
[
  {
    "id": 1,
    "name": "Filter 1",
    "criteria": [
      {
        "type": "Amount",
        "selection": "1",
        "value": "1000",
        "operator": "greater_than"
      }
    ]
  }
]
```

### 2. **POST /api/filters**

- **Description**: Add a new filter.
- **Request Body**:

```json
{
  "name": "New Filter",
  "criteria": [
    {
      "type": "Amount",
      "selection": "2",
      "value": "500",
      "operator": "less_than"
    }
  ]
}
```

- **Response**: Returns the newly created filter object.

### 3. **DELETE /api/filters/{id}**

- **Description**: Delete a filter by ID.
- **Parameters**: `id` (Filter ID)

- **Response**: Returns a success message upon successful deletion.

### 4. **PUT /api/filters/{id}**

- **Description**: Update an existing filter by ID.
- **Request Body**:

 ```json
{
  "name": "Updated Filter",
  "criteria": [
    {
      "type": "Amount",
      "selection": "3",
      "value": "2000",
      "operator": "equals"
    }
  ]
}
```

- **Response**: Returns the updated filter object.
