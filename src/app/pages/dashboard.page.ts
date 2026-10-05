import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { BaccaApi } from '../core/api/baccacode-api';
import { Auth } from '../core/auth/auth';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { QuizDto } from '../core/models';
import { ErrorState, Loading } from '../shared/status';
import { PriorityTopicCard, ProgressCard, RecentQuizList, TopicStrip } from './dashboard.parts';

@Component({
  selector: 'bc-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Loading, ErrorState, ProgressCard, PriorityTopicCard, RecentQuizList, TopicStrip, ...I18N_PIPES],
  template: `
    <h1 class="bc-page-title">
      {{ (isNew() ? 'dash.welcome' : 'dash.welcomeBack') | t: { name: auth.firstName() } }}
    </h1>

    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      @let d = data.value();
      <div class="bc-dash">
        <div class="bc-dash__main">
          @if (isNew()) {
            <article class="bc-priority-card">
              <p class="bc-marker">{{ 'dash.startHere' | t }}</p>
              <h2>{{ 'dash.checkupTitle' | t }}</h2>
              <p>{{ 'dash.checkupText' | t }}</p>
              <div class="d-flex flex-wrap gap-2">
                @if (d.diagnostic) {
                  <a class="btn btn-primary" [routerLink]="['/quiz', d.diagnostic.id]">{{ 'dash.checkupStart' | t }}</a>
                }
                <a class="btn btn-outline-dark" [routerLink]="['/topics', 1]">{{ 'dash.startTopic1' | t }}</a>
              </div>
            </article>
          } @else if (priority(); as item) {
            <bc-priority-topic-card [item]="item" />
          } @else {
            <article class="bc-priority-card">
              <p class="bc-marker">{{ 'dash.upToDate' | t }}</p>
              <h2>{{ 'dash.allMasteredTitle' | t }}</h2>
              <p class="mb-3">{{ 'dash.allMasteredText' | t }}</p>
              <a class="btn btn-primary align-self-start" routerLink="/topics">{{ 'nav.topics' | t }}</a>
            </article>
          }
        </div>

        <div class="bc-dash__stats">
          <bc-progress-card
            [label]="'dash.overallMastery' | t"
            [value]="d.progress.overallMastery === null ? '—' : d.progress.overallMastery + '%'"
            [hint]="d.progress.overallMastery === null ? ('status.NotAssessed' | t) : ''"
          />
          <bc-progress-card
            [label]="'dash.topicsCompleted' | t"
            [value]="d.progress.topicsCompleted + '/' + d.progress.topicsTotal"
          />
          <bc-progress-card
            [label]="'dash.avgScore' | t"
            [value]="d.progress.averageQuizScore === null ? '—' : d.progress.averageQuizScore + '%'"
            [hint]="d.progress.quizzesTaken ? ('dash.quizzesTaken' | t: { count: d.progress.quizzesTaken }) : ''"
          />
          <!-- Practice is shown beside mastery, never merged into it (spec 15.8). -->
          <bc-progress-card
            [label]="'dash.practice' | t"
            [value]="auth.user()?.codeforcesHandle ? d.progress.solvedProblems + '/' + d.progress.totalProblems : '—'"
            [hint]="auth.user()?.codeforcesHandle ? ('dash.practiceHint' | t) : ('dash.practiceConnect' | t)"
          />
        </div>

        <section class="bc-dash__strip" aria-labelledby="strip-h">
          <h2 id="strip-h" class="bc-h-md">{{ 'dash.topicProgress' | t }}</h2>
          <bc-topic-strip [topics]="d.topics" />
        </section>

        <section class="bc-dash__recent" aria-labelledby="recent-h">
          <div class="d-flex align-items-baseline justify-content-between">
            <h2 id="recent-h" class="bc-h-md">{{ 'dash.recentQuizzes' | t }}</h2>
            @if (d.recent.length) { <a routerLink="/attempts">{{ 'common.seeAll' | t }}</a> }
          </div>
          <bc-recent-quiz-list [attempts]="d.recent" />
        </section>
      </div>
    } @else {
      <bc-loading />
    }
  `,
})
export class DashboardPage {
  private readonly api = inject(BaccaApi);
  protected readonly auth = inject(Auth);
  protected readonly i18n = inject(I18n);

  protected readonly data = rxResource({
    stream: () =>
      forkJoin({
        progress: this.api.getProgress(),
        plan: this.api.getStudyPlan(),
        recent: this.api.getAttempts({ page: 1, pageSize: 4 }),
        topics: this.api.getTopics(),
      }).pipe(
        switchMap((r) => {
          // Only a student with no quiz history is offered the check-up (spec 8.1.1).
          const diagnostic$: Observable<QuizDto | null> =
            r.progress.quizzesTaken === 0 ? this.api.getDiagnosticQuiz() : of(null);
          return diagnostic$.pipe(map((diagnostic) => ({ ...r, recent: r.recent.items, diagnostic })));
        }),
      ),
  });

  protected readonly isNew = computed(() => (this.data.hasValue() ? this.data.value().progress.quizzesTaken === 0 : false));
  protected readonly priority = computed(() =>
    this.data.hasValue() ? (this.data.value().plan.items.find((i) => i.status === 'Pending') ?? null) : null,
  );
}
