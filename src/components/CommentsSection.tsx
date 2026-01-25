"use client";

import { useState, useEffect, useRef } from "react";
import { Comment, CommentsResponse } from "@/types";
import { cardsAPI, cacheUtils } from "@/services/api";

interface CommentsSectionProps {
  cardId: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

export default function CommentsSection({
  cardId,
  currentUserId,
  onCommentAdded,
  onCommentDeleted,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Ref для відстеження оптимістичних оновлень
  const previousCommentsRef = useRef<Comment[] | null>(null);
  const isAddingRef = useRef(false);

  const limit = 10;

  const fetchComments = async (pageNum: number, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response: CommentsResponse = await cardsAPI.getComments(
        cardId,
        pageNum,
        limit,
      );
      setComments(response.comments);
      setTotalPages(response.totalPages);
      setTotalComments(response.total);
      setPage(response.page);
      previousCommentsRef.current = null;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Помилка завантаження коментарів",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [cardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isAddingRef.current) return;

    // Зберігаємо попередній стан
    if (!previousCommentsRef.current) {
      previousCommentsRef.current = [...comments];
    }

    isAddingRef.current = true;
    setSubmitting(true);
    setError("");

    // Оптимістичне оновлення - додаємо коментар одразу
    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}`,
      userId: currentUserId || "temp",
      username: "Ви",
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment("");

    try {
      await cardsAPI.addComment(cardId, newComment.trim());

      // Очищуємо кеш коментарів
      cacheUtils.clearCards();

      // Перезавантажуємо з сервера
      await fetchComments(1, false);

      onCommentAdded?.();
    } catch (err: any) {
      // Відкат при помилці
      if (previousCommentsRef.current) {
        setComments(previousCommentsRef.current);
        previousCommentsRef.current = null;
      }
      setError(err.response?.data?.message || "Помилка додавання коментаря");
    } finally {
      isAddingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей коментар?")) return;

    // Зберігаємо попередній стан
    if (!previousCommentsRef.current) {
      previousCommentsRef.current = [...comments];
    }

    // Оптимістичне оновлення - видаляємо коментар
    const updatedComments = comments.filter((c) => c._id !== commentId);
    setComments(updatedComments);
    setTotalComments((prev) => Math.max(0, prev - 1));

    try {
      await cardsAPI.deleteComment(cardId, commentId);

      // Очищуємо кеш
      cacheUtils.clearCards();

      onCommentDeleted?.();
    } catch (err: any) {
      // Відкат при помилці
      if (previousCommentsRef.current) {
        setComments(previousCommentsRef.current);
        setTotalComments(previousCommentsRef.current.length);
        previousCommentsRef.current = null;
      }
      alert(err.response?.data?.message || "Помилка видалення коментаря");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("uk-UA", options);
  };

  const isOwnComment = (comment: Comment) => {
    const userId =
      typeof comment.userId === "object" ? comment.userId._id : comment.userId;
    return userId === currentUserId;
  };

  const isTempComment = (commentId: string) => {
    return commentId.startsWith("temp-");
  };

  const getUserInitial = (username?: string) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-6">
        Коментарі ({totalComments})
      </h2>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
            {getUserInitial("Ви")}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишіть свій коментар..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50 resize-none"
              disabled={submitting}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2 bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Відправка..." : "Додати коментар"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-rose-600 dark:text-rose-400">
            Завантаження коментарів...
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>Коментарів поки немає. Будьте першим!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`flex gap-4 p-4 bg-white/50 dark:bg-dark-700/50 rounded-xl ${
                isTempComment(comment._id) ? "opacity-60 animate-pulse" : ""
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-300 to-amber-300 rounded-full flex items-center justify-center text-white font-bold">
                {getUserInitial(comment.username)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {comment.username || "Анонім"}
                  </span>
                  <span className="text-sm text-gray-400">
                    {isTempComment(comment._id)
                      ? "Відправляється..."
                      : formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.text}
                </p>
                {currentUserId &&
                  isOwnComment(comment) &&
                  !isTempComment(comment._id) && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="mt-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Видалити
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => fetchComments(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Попередня
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Сторінка {page} з {totalPages}
          </span>
          <button
            onClick={() => fetchComments(page + 1)}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Наступна
          </button>
        </div>
      )}
    </div>
  );
}
