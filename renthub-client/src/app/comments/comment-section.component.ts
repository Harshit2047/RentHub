import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentService } from '../core/comment.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';
import { CommentItem } from '../models/comment.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <!-- Section Header -->
      <div class="flex items-center justify-between pb-5 border-b border-slate-100 flex-wrap gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Questions & Discussions</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                  {{ comments.length }}
                </span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Both prospective renters and the landlord can discuss property details, house rules, and negotiate terms here.
              </p>
            </div>
          </div>
        </div>

        <button
          *ngIf="comments.length > 0"
          type="button"
          (click)="loadComments()"
          [disabled]="isLoading"
          class="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.animate-spin]="isLoading">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <!-- New Comment / Question Box (Top) -->
      <div class="mt-6">
        <div *ngIf="isAuthenticated; else loginPrompt">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
              {{ userInitial }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="relative">
                <textarea
                  [(ngModel)]="newCommentContent"
                  rows="3"
                  placeholder="Ask a question about this apartment, request details, or discuss rental terms..."
                  class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 resize-y"
                  [disabled]="isPosting"
                ></textarea>
              </div>
              <div class="flex items-center justify-between mt-2.5 flex-wrap gap-2">
                <span class="text-[11px] text-slate-400 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>Public inquiry visible to all prospective tenants & landlord</span>
                </span>
                <button
                  type="button"
                  (click)="onPostComment()"
                  [disabled]="isPosting || !newCommentContent.trim()"
                  class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span>{{ isPosting ? 'Posting...' : 'Post Question / Comment' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #loginPrompt>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div class="flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span class="text-xs text-slate-700 font-medium">
                Have a question or want to discuss rental terms? Log in to join the discussion.
              </span>
            </div>
            <a
              routerLink="/login"
              class="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors whitespace-nowrap"
            >
              Log In to Comment
            </a>
          </div>
        </ng-template>
      </div>

      <!-- Comments Thread List -->
      <div class="mt-8 space-y-6">
        <!-- Skeleton Loading -->
        <div *ngIf="isLoading" class="space-y-4">
          <div *ngFor="let s of [1, 2]" class="animate-pulse flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-200"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-1/4 bg-slate-200 rounded"></div>
              <div class="h-12 w-full bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && comments.length === 0" class="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200">
          <div class="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 class="text-sm font-bold text-slate-800">No discussions yet</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Be the first to ask about move-in dates, security deposit terms, maintenance charges, or pet policies!
          </p>
        </div>

        <!-- Render Comments -->
        <div *ngIf="!isLoading && comments.length > 0" class="space-y-5">
          <div
            *ngFor="let comment of comments"
            class="comment-card rounded-xl border border-slate-200/90 p-4 transition-all hover:border-slate-300"
            [class.border-indigo-200]="isLandlordUser(comment.userId)"
            [class.bg-slate-50_30]="!isLandlordUser(comment.userId)"
          >
            <!-- Comment Header -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border"
                  [class.bg-indigo-100]="isLandlordUser(comment.userId)"
                  [class.text-indigo-800]="isLandlordUser(comment.userId)"
                  [class.border-indigo-300]="isLandlordUser(comment.userId)"
                  [class.bg-slate-100]="!isLandlordUser(comment.userId)"
                  [class.text-slate-700]="!isLandlordUser(comment.userId)"
                  [class.border-slate-200]="!isLandlordUser(comment.userId)"
                >
                  {{ (comment.user?.fullName || 'U').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-sm text-slate-900">{{ comment.user?.fullName || 'User' }}</span>
                    
                    <!-- Role Badge -->
                    <span
                      *ngIf="isLandlordUser(comment.userId)"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      <span>Landlord</span>
                    </span>
                    <span
                      *ngIf="!isLandlordUser(comment.userId)"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      Prospective Renter
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    {{ formatTimestamp(comment.createdAt) }}
                  </div>
                </div>
              </div>

              <!-- Author Actions (Edit / Delete) -->
              <div *ngIf="isAuthor(comment.userId)" class="flex items-center gap-1">
                <button
                  type="button"
                  (click)="startEdit(comment)"
                  class="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                  title="Edit comment"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  (click)="onDelete(comment.id)"
                  class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs"
                  title="Delete comment"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Comment Body / Inline Edit -->
            <div class="mt-3 text-sm text-slate-700 pl-11">
              <div *ngIf="editingCommentId !== comment.id">
                <p class="whitespace-pre-line leading-relaxed">{{ comment.content }}</p>
              </div>

              <!-- Edit Form -->
              <div *ngIf="editingCommentId === comment.id" class="space-y-2 mt-1">
                <textarea
                  [(ngModel)]="editContent"
                  rows="2"
                  class="w-full px-3 py-2 text-sm rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                ></textarea>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="saveEdit(comment)"
                    [disabled]="isSavingEdit || !editContent.trim()"
                    class="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {{ isSavingEdit ? 'Saving...' : 'Save' }}
                  </button>
                  <button
                    type="button"
                    (click)="cancelEdit()"
                    class="px-3 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <!-- Reply Action Button -->
              <div class="mt-3 flex items-center gap-3" *ngIf="editingCommentId !== comment.id">
                <button
                  type="button"
                  (click)="toggleReplyBox(comment.id)"
                  class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                  </svg>
                  <span>Reply</span>
                </button>
                <span class="text-slate-300">•</span>
                <span class="text-xs text-slate-400">
                  {{ (comment.replies && comment.replies.length) ? comment.replies.length + (comment.replies.length === 1 ? ' reply' : ' replies') : 'No replies yet' }}
                </span>
              </div>
            </div>

            <!-- Nested Replies Thread -->
            <div *ngIf="comment.replies && comment.replies.length > 0" class="mt-4 pl-8 sm:pl-11 space-y-3">
              <div class="border-l-2 border-indigo-100 pl-4 space-y-3">
                <div
                  *ngFor="let reply of comment.replies"
                  class="bg-slate-50/70 rounded-xl p-3 border border-slate-100"
                  [class.border-indigo-100]="isLandlordUser(reply.userId)"
                  [class.bg-indigo-50_30]="isLandlordUser(reply.userId)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border"
                        [class.bg-indigo-100]="isLandlordUser(reply.userId)"
                        [class.text-indigo-800]="isLandlordUser(reply.userId)"
                        [class.border-indigo-300]="isLandlordUser(reply.userId)"
                        [class.bg-white]="!isLandlordUser(reply.userId)"
                        [class.text-slate-700]="!isLandlordUser(reply.userId)"
                        [class.border-slate-200]="!isLandlordUser(reply.userId)"
                      >
                        {{ (reply.user?.fullName || 'U').charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="font-bold text-xs text-slate-900">{{ reply.user?.fullName || 'User' }}</span>
                          <span
                            *ngIf="isLandlordUser(reply.userId)"
                            class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200"
                          >
                            Landlord
                          </span>
                        </div>
                        <div class="text-[10px] text-slate-400">
                          {{ formatTimestamp(reply.createdAt) }}
                        </div>
                      </div>
                    </div>

                    <!-- Author actions for reply -->
                    <div *ngIf="isAuthor(reply.userId)" class="flex items-center gap-1">
                      <button
                        type="button"
                        (click)="startEdit(reply)"
                        class="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors text-xs cursor-pointer"
                        title="Edit reply"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        (click)="onDelete(reply.id)"
                        class="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors text-xs cursor-pointer"
                        title="Delete reply"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Reply Content / Edit Box -->
                  <div class="mt-1.5 text-xs text-slate-700 pl-9">
                    <p *ngIf="editingCommentId !== reply.id" class="whitespace-pre-line leading-relaxed">
                      {{ reply.content }}
                    </p>

                    <div *ngIf="editingCommentId === reply.id" class="space-y-2 mt-1">
                      <textarea
                        [(ngModel)]="editContent"
                        rows="2"
                        class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      ></textarea>
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          (click)="saveEdit(reply)"
                          [disabled]="isSavingEdit || !editContent.trim()"
                          class="px-2.5 py-1 rounded bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          (click)="cancelEdit()"
                          class="px-2.5 py-1 rounded border border-slate-300 text-slate-600 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Inline Reply Box -->
            <div *ngIf="activeReplyCommentId === comment.id" class="mt-4 pl-8 sm:pl-11">
              <div *ngIf="isAuthenticated; else replyLogin">
                <div class="bg-indigo-50/50 rounded-xl p-3 border border-indigo-200">
                  <div class="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2">
                      <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                    </svg>
                    <span>Replying to {{ comment.user?.fullName || 'comment' }}</span>
                  </div>
                  <textarea
                    [(ngModel)]="replyContent"
                    rows="2"
                    placeholder="Write your response, clarify details, or negotiate terms..."
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    [disabled]="isPostingReply"
                  ></textarea>
                  <div class="flex items-center justify-end gap-2 mt-2">
                    <button
                      type="button"
                      (click)="cancelReply()"
                      class="px-3 py-1 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      (click)="onPostReply(comment.id)"
                      [disabled]="isPostingReply || !replyContent.trim()"
                      class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {{ isPostingReply ? 'Replying...' : 'Send Reply' }}
                    </button>
                  </div>
                </div>
              </div>
              <ng-template #replyLogin>
                <div class="text-xs text-slate-500 py-2">
                  Please <a routerLink="/login" class="text-indigo-600 font-bold hover:underline">log in</a> to reply.
                </div>
              </ng-template>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-slate-50_30 {
      background-color: rgba(248, 250, 252, 0.4);
    }
    .bg-indigo-50_30 {
      background-color: rgba(238, 242, 255, 0.4);
    }
  `]
})
export class CommentSectionComponent implements OnInit, OnDestroy {
  @Input() apartmentId!: string;
  @Input() landlordUserId?: string | null;

  comments: CommentItem[] = [];
  isLoading = false;
  isPosting = false;
  isPostingReply = false;
  isSavingEdit = false;

  newCommentContent = '';
  activeReplyCommentId: string | null = null;
  replyContent = '';

  editingCommentId: string | null = null;
  editContent = '';

  private destroy$ = new Subject<void>();

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUserId(): string | null {
    return this.authService.currentUser?.id || null;
  }

  get userInitial(): string {
    const name = this.authService.currentUser?.fullName || 'U';
    return name.charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    if (this.apartmentId) {
      this.loadComments();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadComments(): void {
    if (!this.apartmentId) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.commentService.getApartmentComments(this.apartmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.comments = comments;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Failed to load comments:', err);
          this.cdr.detectChanges();
        }
      });
  }

  onPostComment(): void {
    const content = this.newCommentContent.trim();
    if (!content) return;

    if (!this.isAuthenticated) {
      this.toast.info('Please log in to post a question.');
      return;
    }

    this.isPosting = true;
    this.cdr.detectChanges();

    this.commentService.postComment(this.apartmentId, content).subscribe({
      next: (created) => {
        this.newCommentContent = '';
        this.isPosting = false;
        this.toast.success('Question / comment posted successfully!');
        // Prepend to list or reload
        this.loadComments();
      },
      error: (err) => {
        this.isPosting = false;
        const msg = err?.error?.message || err?.message || 'Failed to post comment.';
        this.toast.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  toggleReplyBox(commentId: string): void {
    if (!this.isAuthenticated) {
      this.toast.info('Please log in to reply.');
      return;
    }
    if (this.activeReplyCommentId === commentId) {
      this.activeReplyCommentId = null;
      this.replyContent = '';
    } else {
      this.activeReplyCommentId = commentId;
      this.replyContent = '';
    }
    this.cdr.detectChanges();
  }

  cancelReply(): void {
    this.activeReplyCommentId = null;
    this.replyContent = '';
    this.cdr.detectChanges();
  }

  onPostReply(commentId: string): void {
    const content = this.replyContent.trim();
    if (!content) return;

    this.isPostingReply = true;
    this.cdr.detectChanges();

    this.commentService.postReply(commentId, content).subscribe({
      next: (reply) => {
        this.replyContent = '';
        this.activeReplyCommentId = null;
        this.isPostingReply = false;
        this.toast.success('Reply posted!');
        this.loadComments();
      },
      error: (err) => {
        this.isPostingReply = false;
        const msg = err?.error?.message || err?.message || 'Failed to post reply.';
        this.toast.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  startEdit(item: CommentItem): void {
    this.editingCommentId = item.id;
    this.editContent = item.content;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editContent = '';
    this.cdr.detectChanges();
  }

  saveEdit(item: CommentItem): void {
    const content = this.editContent.trim();
    if (!content) return;

    this.isSavingEdit = true;
    this.cdr.detectChanges();

    this.commentService.editComment(item.id, content).subscribe({
      next: (updated) => {
        item.content = updated.content;
        this.editingCommentId = null;
        this.editContent = '';
        this.isSavingEdit = false;
        this.toast.success('Comment updated!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingEdit = false;
        const msg = err?.error?.message || err?.message || 'Failed to update comment.';
        this.toast.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  onDelete(commentId: string): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.toast.info('Comment removed.');
        this.loadComments();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Failed to delete comment.';
        this.toast.error(msg);
      }
    });
  }

  isAuthor(userId: string): boolean {
    return !!this.currentUserId && this.currentUserId === userId;
  }

  isLandlordUser(userId: string): boolean {
    if (this.landlordUserId && this.landlordUserId === userId) return true;
    return false;
  }

  formatTimestamp(isoDate: string): string {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return isoDate;
    }
  }
}

