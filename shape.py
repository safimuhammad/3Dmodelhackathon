from gradio_client import Client
import shutil
import os
import threading
import requests
import trimesh
from queue import Queue


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


def combine_model(model1, model2, filename):
    chair_glb = trimesh.load(model1)
    chair_glb.export(f"{model1[:-4]}.obj")
    chair = trimesh.load_mesh(f"{model1[:-4]}.obj")

    seat_glb = trimesh.load(model2)
    seat_glb.export(f"{model2[:-4]}.obj")
    seat = trimesh.load_mesh(f"{model2[:-4]}.obj")
    combined = trimesh.util.concatenate(chair, seat)

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
    prompts = [
        (
            """Render a legless invisible legged square tabletop for a standard dining table. The tabletop dimensions should be 80 cm in length and 80 cm in width.""",
            "table_top",
            6654,
        ),
        (
            # """Render identical table  for the The tabletop dimensions should be 120 cm in length and 80 cm in width and 30cm thick. Each leg should have a height of 75 cm tabletop should be invisible.""",
            "Render a topless invisible top, dining table. The tabletop dimensions should be 80 cm in length and 80 cm in width.",
            "table_legs",
            2342,
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
        combine_model(model_paths[0], model_paths[1], "final_chair_model")
        # You can add more combining logic here for additional chair parts
        print("All chair components successfully combined into a final model.")
    else:
        print("One or more chair components could not be generated.")
