'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

type Emotion = 
  | '행복한, 좋은 표정'
  | '짜증난, 싫은 표정'
  | '두려운, 무서운 표정'
  | '화난, 분노의 표정'
  | '슬픈, 우울한 표정'
  | '놀란, 놀라는 표정'
  | '덤덤한, 무표정';

type PredictionResponse = {
  results: Array<{
    predictions: Array<{
      label: string;
      probability: number;
    }>;
  }>;
};

const Preview = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const emotions: Emotion[] = [
    '행복한, 좋은 표정',
    '짜증난, 싫은 표정',
    '두려운, 무서운 표정',
    '화난, 분노의 표정',
    '슬픈, 우울한 표정',
    '놀란, 놀라는 표정',
    '덤덤한, 무표정'
  ];

  const getEmoticonForEmotion = (emotion: Emotion): string => {
    const emoticons: Record<Emotion, string> = {
      '행복한, 좋은 표정': '😄',
      '짜증난, 싫은 표정': '😣',
      '두려운, 무서운 표정': '😨',
      '화난, 분노의 표정': '😠',
      '슬픈, 우울한 표정': '😢',
      '놀란, 놀라는 표정': '😲',
      '덤덤한, 무표정': '😐'
    };
    return emoticons[emotion] || '❓';
  };

  const stopCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const startCamera = async () => {
    if (isInitializing) return;
    setIsInitializing(true);
    
    try {
      await stopCamera(); 
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('카메라 접근 에러:', err);
      alert('카메라를 시작할 수 없습니다. 카메라 접근 권한을 확인해주세요.');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (selectedEmotion && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [selectedEmotion, capturedImage]);

  const handleEmotionSelect = (emotion: Emotion) => {
    setCapturedImage(null);
    setIsLoading(false);
    setError(null);
    setAnalysisResult(null);
    setSelectedEmotion(emotion);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    await stopCamera();

    setIsLoading(true);
    try {
      const base64Data = imageData.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'captured_image.jpg');
      formData.append('emotion', selectedEmotion || '');

      const apiUrl = `${process.env.NEXT_PUBLIC_FLASK_APIKEY}/upload`;
      const uploadResponse = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      if (!uploadResponse.ok) {
        throw new Error('다시 시도해 주세요');
      }

      const data: PredictionResponse = await uploadResponse.json();
      
      if (data.results?.[0]?.predictions?.[0]) {
        const prediction = data.results[0].predictions[0];
        setAnalysisResult(prediction.probability * 100);
      }
    } catch (err) {
      console.error('분석 오류:', err);
      setError('이미지 분석 중 오류가 발생했습니다. 다시 시도해 주세요');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = async () => {
    setError(null);
    setAnalysisResult(null);
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
      <div className="h-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row h-full gap-6 lg:gap-8">
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-700 mb-3">촬영 시 주의사항 ✨</h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center">
                  <span className="mr-2">💡</span>
                  밝은 곳에서 촬영해주세요
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📱</span>
                  얼굴을 카메라에 가까이 해주세요
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🎭</span>
                  표정을 최대한 뚜렷하고 분명하게 지어주세요
                </li>
              </ul>
            </div>

            <div className="flex-grow">
              <h2 className="text-2xl font-semibold mb-4">감정 선택</h2>
              <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 md:gap-4">
                {emotions.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionSelect(emotion)}
                    className={`p-2 md:p-4 rounded-xl transition-colors h-20 md:h-24 flex flex-col items-center justify-center ${
                      selectedEmotion === emotion
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-100'
                    }`}
                  >
                    <span className="text-xl md:text-3xl mb-1 md:mb-2">{getEmoticonForEmotion(emotion)}</span>
                    <span className="text-[10px] md:text-sm text-center leading-tight">{emotion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 flex flex-col">
            {selectedEmotion ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                  <p className="text-xl md:text-2xl mb-3">
                    {getEmoticonForEmotion(selectedEmotion)} {selectedEmotion}을 찍어 보세요!
                  </p>
                  <div className="h-[300px] md:h-[400px] bg-gray-200 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                    {capturedImage ? (
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                  <div className="flex justify-center gap-4">
                    {capturedImage ? (
                      <button
                        onClick={retakePhoto}
                        className="bg-gray-500 text-white px-4 md:px-6 py-2 md:py-2.5 text-base md:text-lg rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        다시 찍기
                      </button>
                    ) : (
                      <button
                        onClick={captureAndAnalyze}
                        className="bg-blue-500 text-white px-4 md:px-6 py-2 md:py-2.5 text-base md:text-lg rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        사진 찍기
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center mt-6 md:mt-10">
                  <h2 className="text-xl md:text-2xl font-semibold">표정 분석 결과</h2>
                  {isLoading ? (
                    <div className="text-blue-600">분석중...</div>
                  ) : error ? (
                    <div className="text-red-600">{error}</div>
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-blue-600">
                      {analysisResult ? `${analysisResult.toFixed(1)}%` : '-'}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center text-gray-500">
                감정을 선택해주세요
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;