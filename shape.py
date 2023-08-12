from gradio_client import Client
import shutil
import os
import threading
import requests
import trimesh
from queue import Queue
import random

def get_model(prompt, filename, seed=1, guidance=16, steps=64):
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
                print(f"File moved to: {output_path}")
                return output_path
        else:
            print("Prediction failed or no result received.")
    except requests.exceptions.RequestException as req_err:
        print(f"An error occurred during the request: {req_err}")
    except TimeoutError as timeout_err:
        print(f"Request timed out: {timeout_err}")
    except Exception as general_err:
        print(f"An error occurred: {general_err}")
    return None


def combine_model(model1=None, model2=None, filename=None,color1=None,color2=None):
    if model1 == None:return None
    if model2 == None :return None
    if filename == None :return None
    colors={'red':[255, 0, 0, 255],
    'green': [0, 255, 0, 255],
    'blue': [0, 0, 255, 255],
    'yellow': [255, 255, 0, 255],
    'cyan': [0, 255, 255, 255],
    'magenta': [255, 0, 255, 255],
    'white': [255, 255, 255, 255],
    'black': [0, 0, 0, 255]}

   

    increase_scale = 2.3
    decrease_scale = 0.2
    model1_glb = trimesh.load(model1)
    model1_glb.export(f"{model1[:-4]}.obj")
   
    first_model = trimesh.load_mesh(f"{model1[:-4]}.obj")
    first_model.vertices *= increase_scale
    first_model.visual.vertex_colors = colors[color1.lower()]
    
    min_y, max_y = first_model.bounds[:, 1]
    height = (max_y - min_y)/1.5
    
    # Calculate the desired offset for the second model based on the height of the first model
    y_offset = height

    model2_glb = trimesh.load(model2)
    model2_glb.export(f"{model2[:-4]}.obj")
    second_model = trimesh.load_mesh(f"{model2[:-4]}.obj")
    # second_model.apply_scale(increase_scale)
    second_model.vertices *= decrease_scale
    second_model.visual.vertex_colors = colors[color2.lower()]
    second_model.vertices[:, 1] += y_offset


    combined = trimesh.util.concatenate(first_model,second_model)

    # Save the combined mesh to a new .obj file
    combined.export(f"models/{filename}.glb")
    


def process_prompt(prompt, filename, seed=1, guidance=16, steps=64, result_queue=None):
    result = get_model(prompt, filename, seed, guidance, steps)
    if result:
        model_path = f"models/{filename}.glb"
        result_queue.put(model_path)
    else:
        result_queue.put(None)


if __name__ == "__main__":
    seed_value = random.randint(1, 9999)
    prompts = [
        (
            """Render a modern round top,wooden dining table with. The tabletop dimensions should be 380 cm in length and 380 cm in width.""",
            "table_top",
             random.randint(1, 9999),
        ),
        (
            # """Render identical table  for the The tabletop dimensions should be 120 cm in length and 80 cm in width and 30cm thick. Each leg should have a height of 75 cm tabletop should be invisible.""",
            """beautiful vase, length 8cm x-axis length and 8cm y-axis width """,
            "table_vase",
            random.randint(1, 9999), 
        ),
        # You can keep adding more prompts for different chair parts here
    ]

    threads = []
    result_queue = Queue()

    for prompt, filename, seed in prompts:
        thread = threading.Thread(
            target=process_prompt, args=(prompt, filename, seed, 18, 64, result_queue)
        )
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

    model_paths = [result_queue.get() for _ in prompts]

    # Check if all models were successfully generated
    if all(model_path is not None for model_path in model_paths):
        # Combine the models
        combine_model('models/table_top.glb','models/table_vase.glb', "final_chair_model",'red','cyan')
        # You can add more combining logic here for additional chair parts
        print("All chair components successfully combined into a final model.")
    else:
        print("One or more chair components could not be generated.")
