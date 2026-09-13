# Eunoia

## Overview 

Eunoia is an AI-powered journaling app that allows users to create and manage journal entries with AI-driven mood detection and personalized reflections. Users can add attachments and emotions to their entries, then leverage AI to analyze the mood of their content and receive meaningful insights about their emotional patterns.

<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/6da78ea9-6549-4250-921a-d7cfc90bd921" />

## Core Features

- **Personalized Dashboard:** Get a daily quote, display your profile and cover images, access existing drafts and published entries organized by emotion

<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/9cd7183a-516c-4a8a-8f6f-889fdd2d5385" />

- **Entries Management:** Search and filter entries by date, view published entries, edit draft entries, and delete entries as needed

<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/8c29f3b7-7453-45a3-81c4-5021cf2ec084" />

- **Journal Space:** Select emotions for your entry, write content, and add, view, and download attachments

<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/7da4de1b-7f44-4966-8762-c8768fae1ad7" />

- **AI-Powered Mood Detection & Reflection:** Detect the mood of your entry and receive AI-generated reflections and advice

<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/9276c3ea-01c4-4f7f-ac8a-9ba9de5402ac" />

- **User Authentication:** Secure login and account management

## Tech Stack 

### Languages and Frameworks
- **Python:** Language for loading and using the pre-trained SamLowe/roberta-base-go_emotions model for mood detection
- **FastAPI:** Framework for the Python ML services
- **TypeScript/Next.js:** Frontend application
- **PostgreSQL:** Database for storing user data
- **NestJS/Prisma:** Backend API and ORM
- **Supabase S3:** Cloud storage for user attachments, profile photos, cover images, and emoji assets

### AI Models
- **SamLowe/roberta-base-go_emotions:** Pre-trained model for mood detection (28 emotion classes)
- **Ollama Mistral:** LLM for generating personalized reflections and advice

### External APIs
- **zenquotes.io:** API for retrieving daily quotes

## Deployment Notes

### Current Challenge
The ML services deployment on Render's free tier encountered timeouts during model loading. The `roberta-base-go_emotions` model is large (~500MB) and requires significant memory for initialization.
