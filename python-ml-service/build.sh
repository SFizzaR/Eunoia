#!/bin/bash
pip install --upgrade pip setuptools wheel
pip install --only-binary :all: pydantic-core==2.20.0
pip install -r requirements.txt