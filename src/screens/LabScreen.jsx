/**
 * Student route for a published engine lesson (#/lab/<id>).
 * @module LabScreen
 */
import { assetUrl, loadPublishedLessons } from '../engine/catalog/published.js';
import LessonPlayer from '../lab/LessonPlayer.jsx';
import { loadReviewPreviewLessons } from '../engine/catalog/reviewPreview.js';

export default function LabScreen({ id, onExit, review = false }) {
  const lesson = review
    ? loadReviewPreviewLessons().find((l) => l.id === id)
    : loadPublishedLessons().lessons.find((l) => l.id === id);
  if (!lesson) {
    return (
      <main className="lab" dir="rtl" lang="ar">
        <p className="lab-note">الدرس ده مش منشور أو مش موجود.</p>
        <button type="button" className="lab-btn" onClick={onExit}>
          ارجع للخريطة
        </button>
      </main>
    );
  }
  return <LessonPlayer lesson={lesson} mode={review ? 'preview' : 'student'} onExit={onExit} resolveAsset={assetUrl} />;
}
