from gradio_client import Client
import shutil
import os
import requests
import trimesh
import numpy as np

def get_model(prompt,filename,seed=1,guidance=16,steps=64):
    try:
        flag=False
        client = Client("https://hysts-shap-e.hf.space/")
        result = client.predict(
                        prompt,	# str in 'Prompt' Textbox component
                        seed,	# int | float (numeric value between 0 and 2147483647) in 'Seed' Slider component
                        guidance,	# int | float (numeric value between 1 and 20) in 'Guidance scale' Slider component
                        steps,	# int | float (numeric value between 1 and 100) in 'Number of inference steps' Slider component
                        api_name="/text-to-3d"
        )
        if result:
            project_directory = f"models"  # Change this to your actual project directory path
            output_filename = f"{filename}.glb"  # Change this to the desired output filename

            output_path = os.path.join(project_directory, output_filename)
            if os.path.exists(result):
                shutil.move(result, output_path)
                print(f"File moved to: {output_path}")
                flag=True
        else:
            flag=False
            print("Prediction failed or no result received.")

    except requests.exceptions.RequestException as req_err:
        print(f"An error occurred during the request: {req_err}")
    except TimeoutError as timeout_err:
        print(f"Request timed out: {timeout_err}")
    except Exception as general_err:
        print(f"An error occurred: {general_err}")
    
    return flag

def combine_model(model1,model2,filename):
    chair_glb = trimesh.load(model1)
    chair_glb.export(f'{model1[:-4]}.obj')
    chair = trimesh.load_mesh(f'{model1[:-4]}.obj')

   
    seat_glb = trimesh.load(model2)
    seat_glb.export(f'{model2[:-4]}.obj')
    seat = trimesh.load_mesh(f'{model2[:-4]}.obj')
    combined = trimesh.util.concatenate(chair, seat)
    
    # Save the combined mesh to a new .obj file
    combined.export(f'models/{filename}.glb')

if __name__ =="__main__":
    prompt1="""Create a chair with four 30 cm legs and a 30 cm wide, 40 cm deep seat. 
    The backrest should be 35 cm wide and 40 cm tall,chair standing. The chair can be any material and color."""

    prompt2="""“Create a soft, rectangular pillow,
     15 cm wide and 15 cm deep laying horizontally, to fit on a chair’s seat. 
     The pillow can have blue color and any pattern."""

    # handle muilti prompts with multi threading 

    get_model(prompt1,'test_chair',seed=4356)
    get_model(prompt2,'test_seat',seed=341)
    model1='models/test_chair.glb'
    model2='models/test_seat.glb'
    combine_model(model1,model2,'check')