from gradio_client import Client
import shutil
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import requests
from shape import get_model,combine_model
import random
from fastapi.middleware.cors import CORSMiddleware
# Assuming you have imported the necessary libraries

app = FastAPI()
# Configure CORS settings to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get_model/{prompt}")
async def get_model(prompt: str, filename: str, seed: int = 1, guidance: int = 16, steps: int = 64):
    try:
        client = Client("https://hysts-shap-e.hf.space/")
        result = client.predict(
            prompt,
            seed,
            guidance,
            steps,
            api_name="/text-to-3d",
        )
        if result:
            project_directory = "models"
            output_filename = f"{filename}.glb"

            output_path = os.path.join(project_directory, output_filename)
            if os.path.exists(result):
                shutil.move(result, output_path)
                return FileResponse(output_path, media_type="application/octet-stream", filename=output_filename)
            else:
                raise HTTPException(status_code=500, detail="Prediction successful, but no valid result file received.")
        else:
            raise HTTPException(status_code=500, detail="Prediction failed or no result received.")
    except requests.exceptions.RequestException as req_err:
        raise HTTPException(status_code=500, detail=f"An error occurred during the request: {req_err}")
    except TimeoutError as timeout_err:
        raise HTTPException(status_code=500, detail=f"Request timed out: {timeout_err}")
    except Exception as general_err:
        raise HTTPException(status_code=500, detail=f"An error occurred: {general_err}")

@app.get("/add_model/{prompt}")
async def add_model(prompt:str,filename:str,model1:str,color1:str = None,color2:str=None,guidance: int = 16  ):
    random.seed(random.randint(1, 9999))
    await get_model(prompt,filename,random.randint(1, 9999),guidance)
    if get_model:
        output_path=combine_model(f"models/{model1}.glb",f"models/{filename}.glb",f"{model1}_{filename}",color1,color2)
        
        return FileResponse(output_path, media_type="application/octet-stream", filename=f"{model1}_{filename}.glb")

@app.get("/list_models")
async def list_models():
    models_directory = "models"  # Change this to the actual path of your models directory

    glb_files = [file[:-4] for file in os.listdir(models_directory) if file.endswith(".glb")]
    
    return glb_files

@app.get("/change_color/{model1}/{mode2}/{color1}/{color2}")
def change_color(model1,model2,color1,color2):
    output_path = combine_model(f"models/{model1}.glb",f"models/{model2}.glb",f"{model1}_{model2}",color1,color2)
    return FileResponse(output_path, media_type="application/octet-stream", filename=f"{model1}_{model2}.glb")

# Run the FastAPI application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
