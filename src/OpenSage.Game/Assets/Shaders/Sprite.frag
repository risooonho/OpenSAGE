#version 450

#define FILL_METHOD_NORMAL     0
#define FILL_METHOD_RADIAL_360 1

layout(set = 0, binding = 1) uniform SpriteConstants
{
    vec2 OutputOffset;
    vec2 OutputSize;
    bool IgnoreAlpha;
    int FillMethod;
    float FillAmount;
    float _Padding;
} _SpriteConstants;

layout(set = 1, binding = 0) uniform sampler Sampler;

layout(set = 2, binding = 0) uniform texture2D Texture;

layout(location = 0) in vec2 in_UV;
layout(location = 1) in vec4 in_Color;

layout(location = 0) out vec4 out_Color;

float AngleBetween(vec2 v1, vec2 v2)
{
    const float PI = 3.1415926;
    return atan(v1.x - v2.x, v1.y - v2.y) + PI;
}

bool ShouldDrawFragmentRadial360(vec2 fragCoord)
{
    fragCoord.y = _SpriteConstants.OutputSize.y - fragCoord.y;

    float targetAngle = _SpriteConstants.FillAmount;

    float centerX = _SpriteConstants.OutputSize.x / 2.0;
    float centerY = _SpriteConstants.OutputSize.y / 2.0;
    vec2 center = vec2(centerX, centerY);

    float a = AngleBetween(center, fragCoord);

    return a <= targetAngle;
}

void main()
{
    if (_SpriteConstants.FillMethod == FILL_METHOD_RADIAL_360)
    {
        if (ShouldDrawFragmentRadial360(gl_FragCoord.xy - _SpriteConstants.OutputOffset))
        {
            discard;
        }
    }

    vec4 textureColor = texture(sampler2D(Texture, Sampler), in_UV);

    if (_SpriteConstants.IgnoreAlpha)
    {
        textureColor.w = 1;
    }

    textureColor *= in_Color;

    out_Color = textureColor;
}