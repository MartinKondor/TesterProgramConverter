import os


os.system("npm run build")

with open("build/index.html", "r") as file:
    content = ">\n".join(file.read().split(">"))


new_lines = []
for line in content.split("\n"):
    if "<link" in line:
        new_lines.append(line.replace('href="/', 'href="'))
    elif "<script" in line:
        new_lines.append(line.replace('src="/', 'src="'))
    else:
        new_lines.append(line)


with open("build/index.html", "w+") as file:
    file.write("\n".join(new_lines))
