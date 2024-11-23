from flask import Flask, request, send_file
from PyPDF2 import PdfReader, PdfWriter
import os
from flask_cors import CORS  # Import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins="http://localhost:3000")  # Allow requests from React frontend

# Route to handle PDF protection
@app.route('/upload', methods=['POST'])
def upload_file():
    # Get the uploaded file and password from the request
    file = request.files.get('pdfFile')
    password = request.form.get('password', 'defaultPassword')  # default password if not provided

    if not file:
        return 'No file uploaded.', 400

    # Save the uploaded PDF to a temporary file
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    # Apply password protection to the PDF
    protected_pdf_path = os.path.join('uploads', f'protected_{file.filename}')
    apply_pdf_password(file_path, protected_pdf_path, password)

    # Send the protected PDF back as a download
    return send_file(protected_pdf_path, as_attachment=True, download_name=f'protected_{file.filename}', mimetype='application/pdf')

def apply_pdf_password(input_pdf_path, output_pdf_path, password):
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Add all pages to the writer object
    for page in reader.pages:
        writer.add_page(page)

    # Encrypt the PDF with the provided password
    writer.encrypt(password)

    # Write the protected PDF to a new file
    with open(output_pdf_path, 'wb') as output_file:
        writer.write(output_file)

    # Clean up: Delete the original uploaded file
    os.remove(input_pdf_path)

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(port=5001)
