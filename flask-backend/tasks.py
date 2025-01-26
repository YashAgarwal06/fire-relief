from celery import Celery
import time
import platform
import os
from pdf2image import convert_from_path
import pytesseract
import time
from dotenv import load_dotenv
load_dotenv()
from openai import AzureOpenAI

if platform.system() == 'Windows': # have to remove multithreading if on a windows system
    os.environ.setdefault('FORKED_BY_MULTIPROCESSING', '1')
    
celery = Celery('tasks', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')
celery.conf.result_expires = 600  # 10 minutes

client = AzureOpenAI(
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT"), 
    api_key=os.getenv("API_KEY"),  
    api_version=os.getenv("API_VERSION")
)

HDPROMPT = open('hdprompt.txt', 'r').read()

# prompts ChatGPT
def prompt_gpt(prompt: str, userinput: str) -> str:
    response = client.chat.completions.create(
        model=os.getenv('MODEL'),
        messages=[
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": userinput
            },
        ]
    )
    
    return response.choices[0].message.content


# this celery task will be used to analyze the files uploaded by the user
# when calling this function, we will use the filetype variable to label which file it is (e.g. home declaration doc, amazon orders.zip, etc)
# and handle it accordingly
@celery.task(bind=True)
def analyze_file(self, filetype, filepath):
    
    if filetype == 'HD':
        # perform OCR
        start_time = time.time()
        images = convert_from_path(filepath)
        text = ""
        for i in range(1, 6):
            text += pytesseract.image_to_string(images[i])
        print("OCR Took: --- %s seconds ---" % (time.time() - start_time))
        
        # delete file
        os.remove(filepath)
        
        response = prompt_gpt(HDPROMPT, text)
    
        return response