from OpenGL.GL import *
from OpenGL.GLUT import *
import pygame
import sys

# Read .obj file content from the project directory
obj_file_path = "chair_with_seat.obj"  # Replace with your .obj file name
with open(obj_file_path, "r") as obj_file:
    obj_file_content = obj_file.read()

vertex_list = []
f_lines = []

# Parse .obj file content
for line in obj_file_content.splitlines():
    if line.startswith('v '):
        _, x, y, z = line.split()[1:]
        vertex_list.append((float(x), float(y), float(z)))
    elif line.startswith('f '):
        f_lines.append(line)

# Process "f" lines and create multiple vertices
broken_vertices = []
for f_line in f_lines:
    parts = f_line.split()[1:]
    vertex_indices = [int(part.split('/')[0]) - 1 for part in parts]
    face_vertices = [vertex_list[index] for index in vertex_indices]
    broken_vertices.extend(face_vertices)

# Initialize Pygame
pygame.init()
display = (800, 600)
pygame.display.set_mode(display, DOUBLEBUF | OPENGL)
gluPerspective(45, (display[0] / display[1]), 0.1, 50.0)
glTranslatef(0.0, 0.0, -5)

def draw_vertices():
    glBegin(GL_TRIANGLES)
    for vertex in broken_vertices:
        glColor3fv((1.0, 0.0, 0.0))  # Set color to red for broken vertices
        glVertex3fv(vertex)
    glEnd()

def main():
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
        
        glRotatef(1, 3, 1, 1)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        draw_vertices()
        pygame.display.flip()
        pygame.time.wait(10)

if __name__ == "__main__":
    main()
