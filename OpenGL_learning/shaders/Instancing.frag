#version 330 core

in vec2 TexCoords;
in vec3 Normal;
in vec3 FragPos;
in vec3 fColor;

out vec4 color;

uniform sampler2D texture_diffuse1;
uniform vec3 lightPos;
uniform vec3 lightColor;
uniform vec3 viewPos;

void main()
{
	//Ambient
	float ambientStrength = 0.1;
	vec3 ambient = ambientStrength * lightColor;

	//Diffuse
	vec3 norm = normalize(Normal);
	vec3 lightDir = normalize(lightPos - FragPos);
	float diff = max(dot(norm, lightDir), 0.0);
	vec3 diffuse = diff * lightColor;

	float specularStrength = 0.5;
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 reflectDir = reflect(-lightDir, norm);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
	vec3 specular = specularStrength * spec * lightColor;

	vec3 result = (ambient + diffuse + specular) * fColor;
	color = vec4(result, 1.0f);


	//color = texture(texture_diffuse1, TexCoords);
}