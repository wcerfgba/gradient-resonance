#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;



// From https://github.com/Jam3/glsl-hsl2rgb

float hue2rgb(float f1, float f2, float hue) {
    if (hue < 0.0)
        hue += 1.0;
    else if (hue > 1.0)
        hue -= 1.0;
    float res;
    if ((6.0 * hue) < 1.0)
        res = f1 + (f2 - f1) * 6.0 * hue;
    else if ((2.0 * hue) < 1.0)
        res = f2;
    else if ((3.0 * hue) < 2.0)
        res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
    else
        res = f1;
    return res;
}

vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb;
    
    if (hsl.y == 0.0) {
        rgb = vec3(hsl.z); // Luminance
    } else {
        float f2;
        
        if (hsl.z < 0.5)
            f2 = hsl.z * (1.0 + hsl.y);
        else
            f2 = hsl.z + hsl.y - hsl.y * hsl.z;
            
        float f1 = 2.0 * hsl.z - f2;
        
        rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
        rgb.g = hue2rgb(f1, f2, hsl.x);
        rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
    }   
    return rgb;
}

vec3 hsl2rgb(float h, float s, float l) {
    return hsl2rgb(vec3(h, s, l));
}


// Gradient Resonance

// The background is a simple gradient from top to bottom.
vec4 bg(vec2 st) {
    vec3 color_top = hsl2rgb(vec3(180./360., 1., 0.5));
    vec3 color_bottom = hsl2rgb(vec3(60./360., 1., 0.5));

    vec3 color = st.y * color_top + (1. - st.y) * color_bottom;  
    
    return vec4(color, 1.);
}

// We draw a grid of squares spaced by unit width. Each column is slightly 
// offset along the vertical. Each square has the same gradient as the
// background.
vec4 square(vec2 st) {
    float scale = 0.15;
    float offset_x = 0.106;
    float phase_x = (st.x + offset_x) / scale;
    float offset_y = offset_x + 0.1 * floor(phase_x);
    float phase_y = (st.y + offset_y) / scale;

    vec2 square_st = vec2(phase_x - floor(phase_x), phase_y - floor(phase_y));
    float a = floor((mod(floor(phase_x), 2.) + mod(floor(phase_y), 2.))  / 2.);

    return vec4(bg(square_st).xyz, a);
}

// The painting is a composition of the squares on top of the background.
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.y;
    if (u_resolution.x < u_resolution.y) {
        st = gl_FragCoord.xy/u_resolution.x;
    }

    vec4 bg = bg(st);
    vec4 square = square(st);
    
    vec3 color = (bg.xyz * (1. - square.a)) + (square.xyz * square.a);
        
    gl_FragColor = vec4(color, 1.);
}
