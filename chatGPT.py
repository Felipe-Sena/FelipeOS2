import openai
import json
import sys
# -*- coding: utf-8 -*-
f = open("config.json")
key = json.load(f)
# API KEY
openai.api_key = key["openAIKey"]
f.close()
# Use the ChatGPT model to generate text
model_engine = "text-davinci-003"
prompt = sys.argv[1]
completion = openai.Completion.create(engine=model_engine, prompt=prompt, max_tokens=1024, n=1,stop=None,temperature=0.7)
message = completion.choices[0].text
print(u'{0}'.format(message))
sys.stdout.flush()