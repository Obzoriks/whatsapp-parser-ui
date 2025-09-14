# Whatsapp Export Parser

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Description
**Whatsapp Export Parser** is a web application for viewing and analyzing exported WhatsApp chats.  
You can upload ZIP archives of exported conversations and browse them directly in your browser with convenient filtering by message type (text, image, video, file).

The app supports:
- Text messages
- Images
- Videos
- Files
- Smooth Infinite Scroll for large chats
- Animations and modern UI with author highlighting and message type indicators

---

## Screenshots

![Home Page](screenshots/home.png)  
*Example interface with a loaded chat*

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone git@github.com:username/whatsapp-export-parser.git
cd whatsapp-export-parser
````

### 2. Frontend setup

```bash
cd frontend
npm install
npm start
```

* The app will be available at [http://localhost:3000](http://localhost:3000)

### 3. Backend setup

```bash
cd backend
npm install
npm start
```

* The backend runs on `http://localhost:3001`
* Handles ZIP uploads and media storage in `/files` and `/uploads`

---

## Usage

1. On the frontend, select a WhatsApp chat ZIP file.
2. Filter messages by type (`All`, `Text`, `Image`, `Video`, `File`).
3. Scroll through the chat using infinite scroll.
4. Enjoy smooth animations and a modern, responsive UI.

---

## Project Structure

```
WhatsappExportParser/
│
├─ frontend/          # React + Tailwind UI
├─ backend/           # Node.js + Express server for ZIP processing
├─ README.md          # Documentation
└─ .gitignore
```

---

## Technologies

* React + Tailwind CSS
* Framer Motion (animations)
* Node.js + Express
* Axios
* Infinite Scroll

---

## License

This project is licensed under the [MIT License](LICENSE).
