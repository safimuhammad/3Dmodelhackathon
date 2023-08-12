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


def change_color(mesh, new_color):
    if isinstance(mesh, trimesh.Scene):
        for node in mesh.geometry:
            if isinstance(node, trimesh.Trimesh):
                if node.visual:
                    vertex_colors = node.visual.color.ColorVisuals(node).vertex_colors
                    vertex_colors[:, :] = new_color
                else:
                    print("Mesh has no color information. Adding default color.")
                    node.visual = trimesh.visual.color.ColorVisuals(
                        node, vertex_colors=new_color
                    )
        return mesh
    elif isinstance(mesh, trimesh.Trimesh):
        if mesh.visual:
            vertex_colors = mesh.visual.color.ColorVisuals(mesh).vertex_colors
            vertex_colors[:, :] = new_color
        else:
            print("Mesh has no color information. Adding default color.")
            mesh.visual = trimesh.visual.color.ColorVisuals(
                mesh, vertex_colors=new_color
            )
        return mesh
    else:
        print("Unsupported mesh type.")
        return None


def change_and_combine_model(model1_path, model2_path, new_color, combined_filename):
    chair_glb = trimesh.load(model1_path)
    chair_glb = change_color(chair_glb, new_color)

    seat_glb = trimesh.load(model2_path)
    seat_glb = change_color(seat_glb, new_color)

    combined_meshes = [chair_glb, seat_glb]

    combined_scene = trimesh.Scene(combined_meshes)

    # Save the combined scene to a new .glb file
    combined_scene.export(f"models/{combined_filename}.glb")


def get_user_color_choice():
    red = int(input("Enter the red value (0-255): "))
    green = int(input("Enter the green value (0-255): "))
    blue = int(input("Enter the blue value (0-255): "))
    return red, green, blue


if __name__ == "__main__":
    prompts = [
        (
            """Render a only rectangular tabletop for a standard dining table. The tabletop dimensions should be 120 cm in length and 80 cm in width, table color should be black.""",
            "table_top",
            1236,
        ),
        (
            """Render a decorative vase to be placed on the dining table. The vase should have an elegant design and stand approximately 30 cm tall. The color of the vase should be white.""",
            "vase",
            9101,
        ),
        # You can keep adding more prompts for different parts here
    ]

    threads = []
    result_queue = Queue()

    for prompt, filename, seed in prompts:
        thread = threading.Thread(
            target=process_prompt, args=(prompt, filename, seed, 16, 64, result_queue)
        )
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

    model_paths = [result_queue.get() for _ in prompts]

    if all(model_path is not None for model_path in model_paths):
        # Combine the models
        combine_model(model_paths[0], model_paths[1], "final_chair_model")

        user_choice = input("Do you want to change the color of the model? (yes/no): ")
        if user_choice.lower() == "yes":
            new_color = get_user_color_choice()

            # Change and combine the models with the user's chosen color
            change_and_combine_model(
                model_paths[0], model_paths[1], new_color, "final_colored_chair_model"
            )
            print(
                "All chair components successfully combined into a final model with the updated color."
            )
        else:
            print("All chair components successfully combined into a final model.")
    else:
        print("One or more chair components could not be generated.")
