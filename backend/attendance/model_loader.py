import json
import numpy as np
from tensorflow import keras
import tensorflow as tf
from django.conf import settings
from PIL import Image
import io
import base64


class FaceRecognitionModel:
    def __init__(self):
        self.model = None
        self.metadata = None
        self.labels = None
        self.load_model()

    def load_model(self):
        try:
            with open(settings.METADATA_PATH, 'r') as f:
                self.metadata = json.load(f)
            self.labels = self.metadata.get('labels', [])

            self.model = keras.models.model_from_json(
                open(settings.MODEL_PATH).read()
            )

            self.model.load_weights(settings.WEIGHTS_PATH)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def preprocess_image(self, image_data):
        try:
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
                image_data = base64.b64decode(image_data)

            image = Image.open(io.BytesIO(image_data))

            image_size = self.metadata.get('imageSize', 224)
            image = image.resize((image_size, image_size))
            image = np.array(image) / 255.0

            image = np.expand_dims(image, axis=0)
            return image
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            raise

    def predict(self, image_data):
        try:
            processed_image = self.preprocess_image(image_data)

            predictions = self.model.predict(processed_image, verbose=0)

            predicted_class = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class])

            label = self.labels[predicted_class] if predicted_class < len(self.labels) else "Unknown"

            return {
                'label': label,
                'confidence': confidence,
                'all_predictions': {
                    self.labels[i]: float(predictions[0][i])
                    for i in range(len(self.labels))
                }
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            raise


model_instance = None


def get_model():
    global model_instance
    if model_instance is None:
        model_instance = FaceRecognitionModel()
    return model_instance
