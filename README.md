\# Investment \& Lease Management Platform



A full-stack web application designed to support investment and lease management workflows, including customer onboarding, KYC verification, payment processing, and administrative operations.



\## Technology Stack



\### Frontend

\- React.js 19

\- JavaScript

\- React Router

\- Axios

\- Google OAuth

\- TensorFlow.js



\### Backend

\- Python

\- Django 5.2

\- PostgreSQL integration

\- REST APIs

\- JWT authentication



\### Integrations

\- Razorpay

\- AWS S3

\- KYC verification

\- SMS and OTP services



\## Project Structure



```text

lease-management-platform/

├── frontend/

├── backend/

├── .gitignore

└── README.md

```



\## Run Locally



\### Frontend



```bash

cd frontend

npm install

npm start

```



\### Backend



```bash

cd backend

python -m venv venv

```



Activate the virtual environment, then:



```bash

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver

```



\## Security



Keep API keys, credentials, private keys, environment files, and customer information out of the repository.



\*Note: Setup instructions and integrations should be verified against the project configuration before use.\*

