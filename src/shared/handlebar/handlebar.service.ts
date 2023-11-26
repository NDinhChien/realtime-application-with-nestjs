import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HandleBarService {
  private readonly recoverTemplate: handlebars.TemplateDelegate;
  private readonly registerTemplate: handlebars.TemplateDelegate;
  constructor() {
    this.recoverTemplate = this.loadTemplate('recover.hbs');
    this.registerTemplate = this.loadTemplate('register.hbs');
  }

  public getRecoverHtml(context: {username: string, code: string, url: string, expiration: string}): string {
    return this.recoverTemplate(context);
  }

  public getRegisterHtml(context: {email: string, code: string, url: string, expiration: string}): string {
    return this.registerTemplate(context);
  }
  
  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    const templatePath = path.join(__dirname, 'templates', templateName);
    const source = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(source);
  }
}