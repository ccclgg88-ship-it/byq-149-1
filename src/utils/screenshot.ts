export function capturePNG(): void {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    console.warn('No canvas found for screenshot');
    return;
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `org-nebula-${timestamp}.png`;

    const dataURL = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
  }
}

export async function startRecording(durationSec: number = 10): Promise<void> {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.warn('No canvas found for recording');
    return;
  }

  try {
    const stream = canvas.captureStream(60);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `org-nebula-recording-${timestamp}.webm`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();

    setTimeout(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    }, durationSec * 1000);
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}
