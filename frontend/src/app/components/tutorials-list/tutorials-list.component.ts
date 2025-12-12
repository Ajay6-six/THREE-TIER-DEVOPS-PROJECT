import { Component, OnInit } from '@angular/core';
import { Tutorial } from 'src/app/models/tutorial.model';
import { TutorialService } from 'src/app/services/tutorial.service';

@Component({
  selector: 'app-tutorials-list',
  templateUrl: './tutorials-list.component.html',
  styleUrls: ['./tutorials-list.component.css']
})
export class TutorialsListComponent implements OnInit {

  tutorials: Tutorial[] = [];
  currentTutorial: Tutorial = {};
  currentIndex = -1;
  title = '';
  page = 1;

  constructor(private tutorialService: TutorialService) { }

  ngOnInit(): void {
    this.retrieveTutorials();
  }

  retrieveTutorials(): void {
    this.tutorialService.getAll()
      .subscribe({
        next: (data: Tutorial[]) => {
          this.tutorials = data;
          console.log(data);
        },
        error: (e: any) => console.error(e)
      });
  }

  refreshList(): void {
    this.retrieveTutorials();
    this.currentTutorial = {};
    this.currentIndex = -1;
  }

  setActiveTutorial(tutorial: Tutorial, index: number): void {
    this.currentTutorial = tutorial;
    this.currentIndex = index;
  }

  removeAllTutorials(): void {
    this.tutorialService.deleteAll()
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.refreshList();
        },
        error: (e: any) => console.error(e)
      });
  }

  searchTitle(): void {
    this.page = 1;

    this.tutorialService.findByTitle(this.title)
      .subscribe({
        next: (data: Tutorial[]) => {
          this.tutorials = data;
          console.log(data);
        },
        error: (e: any) => console.error(e)
      });
  }
}
