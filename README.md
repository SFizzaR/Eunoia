# Eunoia

## Overview 

Eunoia is an AI-powered journaling app that allows users to create and manage journal entries with AI-driven mood detection and personalized reflections. Users can add attachments and emotions to their entries, then leverage AI to analyze the mood of their content and receive meaningful insights about their emotional patterns.

## Core Features

- **Personalized Dashboard:** Get a daily quote, display your profile and cover images, access existing drafts and published entries organized by emotion
- **Entries Management:** Search and filter entries by date, view published entries, edit draft entries, and delete entries as needed
- **Journal Space:** Select emotions for your entry, write content, and add, view, and download attachments
- **AI-Powered Mood Detection & Reflection:** Detect the mood of your entry and receive AI-generated reflections and advice
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
