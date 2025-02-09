FROM python:3.11-slim

# Install system dependencies including gcc and PCSC libraries
RUN apt-get update && apt-get install -y \
    gcc \
    pcscd \
    libpcsclite1 \
    libpcsclite-dev \
    swig \
    && rm -rf /var/lib/apt/lists/*

# Enable systemd
# RUN systemctl enable pcscd

# Set the working directory
WORKDIR /app

# Copy the requirements file and install the dependencies
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Copy the rest of the application code
COPY . .

RUN chmod 755 start.sh

# Start using shell to execute
CMD ["/bin/bash", "./start.sh"]
# # Start the FastAPI server
# CMD uvicorn main:app --host=0.0.0.0 --port=8765 --reload