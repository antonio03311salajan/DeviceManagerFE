Device Manager UI
This is the Angular 17 frontend for the Device Manager system. It provides the web interface for users to search the hardware inventory, view AI-generated device details, and check out/assign equipment to themselves.

Tech Stack
Framework: Angular 17+ (using Standalone Components)

Routing/State: Angular Router, RxJS

Auth: JWT-based authentication via Angular HTTP Interceptors

Prerequisites
Node.js (v18.x or higher)

Angular CLI (npm install -g @angular/cli)

🚀 Local Setup & Running
1. Install Dependencies
Open a terminal in the root of the project and run:

Bash
npm install
2. Point to the Local API
By default, the app expects the .NET backend to be running locally. Check your environment files (or your DeviceService/AuthService) to ensure the API base URL matches your running backend port (usually http://localhost:5133 or https://localhost:7100).

3. Start the Dev Server

Bash
ng serve
Once the compilation finishes, open your browser and navigate to http://localhost:4200/.