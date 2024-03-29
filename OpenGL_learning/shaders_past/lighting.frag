#version 330 core

struct Material
{
	sampler2D diffuse;
	sampler2D specular;
	float shininess;
};

struct DirLight{
	vec3 direction;
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct PointLight{
	vec3 position;
	
	float constant;
	float linear;
	float quadratic;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct SpotLight{
	vec3 position;
	vec3 direction;
	float cutOff;
	float outerCutOff;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;

};
#define NR_POINT_LIGHTS 4

in vec2 TexCoords;
in vec3 Normal;
in vec3 FragPos;

out vec4 color;

uniform Material material;
uniform vec3 viewPos;

uniform DirLight dirLight;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform SpotLight spotLight;

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{

	//一些属性
	vec3 norm = normalize(Normal);
	vec3 viewDir = normalize(viewPos - FragPos);
	
	//第一步，计算平行光照
	vec3 result = CalcDirLight(dirLight, norm, viewDir);

	//第二步，计算顶点光照
	for(int i = 0; i < NR_POINT_LIGHTS; i++)
		result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);

	//第三步，计算Spot light
	result += CalcSpotLight(spotLight, norm, FragPos, viewDir);

	color = vec4(result, 1.0);

}

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir)
{
	vec3 lightDir = normalize(-light.direction);
	//计算漫反射
	float diff = max(dot(normal, lightDir), 0.0);
	//计算镜面反射
	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	//合并各个光照分量
	vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
	vec3 diffuse = light.diffuse * vec3(texture(material.diffuse, TexCoords));
	vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
	
	return (ambient + diffuse + specular);
}

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
	vec3 lightDir = normalize(light.position - fragPos);
	//计算漫反射强度
	float diff = max(dot(normal, lightDir), 0.0);
	//计算镜面反射
	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	//计算衰减
	float distance = length(light.position - fragPos);
	float attenuation = 1.0f /(light.constant + light.linear * distance + light.quadratic*(distance * distance));
	
	//将各个分量合并
	vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
	vec3 diffuse = light.diffuse * vec3(texture(material.diffuse, TexCoords));
	vec3 specular = light.specular * vec3(texture(material.specular, TexCoords));

	return (ambient + diffuse + specular * 0.1) * attenuation;

}

vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
	vec3 lightDir = normalize(light.position - fragPos);
	float theta = dot(lightDir, normalize(-light.direction));
	float epsilon = light.cutOff - light.outerCutOff;
	float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

	//计算漫反射强度
	float diff = max(dot(normal, lightDir), 0.0);
	//计算镜面反射
	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	
	light.diffuse *= intensity;
	light.specular *= intensity;

	//vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
	vec3 diffuse = light.diffuse * vec3(texture(material.diffuse, TexCoords));
	vec3 specular = light.specular * vec3(texture(material.specular, TexCoords));

	return (diffuse + specular * 0.5);

}