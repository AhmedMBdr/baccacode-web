import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/guards';
import { AppShell } from './layout/app-shell';
import { PublicLayout } from './layout/public-layout';
import { AttemptReviewPage } from './pages/attempt-review.page';
import { AttemptsPage } from './pages/attempts.page';
import { DashboardPage } from './pages/dashboard.page';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/login.page';
import { MistakesPage } from './pages/mistakes.page';
import { NotFoundPage } from './pages/not-found.page';
import { ProfilePage } from './pages/profile.page';
import { QuizPage } from './pages/quiz.page';
import { RegisterPage } from './pages/register.page';
import { StudyPlanPage } from './pages/study-plan.page';
import { TopicPage } from './pages/topic.page';
import { TopicsPage } from './pages/topics.page';

/** `data.titleKey` is translated into the document title by App (see app.ts). */
export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', pathMatch: 'full', component: HomePage, data: { titleKey: 'title.home' } },
      { path: 'login', component: LoginPage, canActivate: [guestGuard], data: { titleKey: 'title.login' } },
      { path: 'register', component: RegisterPage, canActivate: [guestGuard], data: { titleKey: 'title.register' } },
    ],
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPage, data: { titleKey: 'nav.dashboard' } },
      { path: 'topics', component: TopicsPage, data: { titleKey: 'nav.topics' } },
      { path: 'topics/:id', component: TopicPage, data: { titleKey: 'nav.topics' } },
      { path: 'quiz/:id', component: QuizPage, data: { titleKey: 'title.quiz' } },
      { path: 'attempts', component: AttemptsPage, data: { titleKey: 'nav.history' } },
      { path: 'attempts/:id', component: AttemptReviewPage, data: { titleKey: 'nav.history' } },
      { path: 'mistakes', component: MistakesPage, data: { titleKey: 'nav.mistakes' } },
      { path: 'study-plan', component: StudyPlanPage, data: { titleKey: 'nav.studyPlan' } },
      { path: 'profile', component: ProfilePage, data: { titleKey: 'nav.profile' } },
    ],
  },
  {
    path: '**',
    component: PublicLayout,
    children: [{ path: '', component: NotFoundPage, data: { titleKey: 'nf.title' } }],
  },
];
