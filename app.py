import gradio as gr

def forest_monitoring(input_text):
    return "Forest monitoring result for: " + input_text

demo = gr.Interface(
    fn=forest_monitoring,
    inputs="text",
    outputs="text",
    title="AI Powered Forest Monitoring"
)

demo.launch()
